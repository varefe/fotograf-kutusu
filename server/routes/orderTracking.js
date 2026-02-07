import express from 'express';
import { connectDB } from '../config/database.js';
import Order from '../models/OrderSchema.js';
import { requireAuth } from '../middleware/userAuth.js';
import { requireAdminRole } from '../middleware/auth.js';
import Iyzipay from 'iyzipay';

const router = express.Router();

/**
 * Iyzico'dan sipariş takibi - Otomatik senkronizasyon (Admin için)
 * Belirli bir tarih aralığındaki ödemeleri Iyzico'dan çekip veritabanına kaydeder
 */
router.post('/sync', requireAdminRole, async (req, res) => {
  try {
    await connectDB();
    
    const { startDate, endDate, paymentIds } = req.body;
    
    // Iyzico API
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || process.env.IYZIPAY_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY || process.env.IYZIPAY_SECRET_KEY,
      uri: process.env.IYZICO_URI || process.env.IYZIPAY_URI || 'https://api.iyzipay.com'
    });
    const syncedOrders = [];
    const errors = [];
    const skippedOrders = [];

    // Eğer paymentIds array verilmişse, direkt onları işle
    if (paymentIds && Array.isArray(paymentIds) && paymentIds.length > 0) {
      console.log(`📋 ${paymentIds.length} payment ID işlenecek`);
      
      for (const paymentId of paymentIds) {
        try {
          let paymentDetail = null;
          
          await new Promise((resolve) => {
            iyzipay.payment.retrieve({ paymentId: paymentId.trim() }, (err, result) => {
              if (err) {
                console.error(`❌ Payment ${paymentId} alınamadı:`, err.message);
                errors.push({ paymentId, error: err.message || 'Payment bulunamadı' });
                resolve(null);
                return;
              }
              paymentDetail = result;
              resolve(result);
            });
          });

          if (!paymentDetail || paymentDetail.status !== 'success') {
            skippedOrders.push({ paymentId, reason: 'Başarısız veya bulunamadı' });
            continue;
          }

          // Sadece başarılı ödemeleri işle
          if (paymentDetail.paymentStatus !== 'SUCCESS') {
            skippedOrders.push({ 
              paymentId, 
              reason: `Ödeme durumu: ${paymentDetail.paymentStatus}` 
            });
            continue;
          }

          // ConversationId'den orderId'yi çıkar
          const orderIdMatch = paymentDetail.conversationId?.match(/ORDER-(\d+)/);
          const orderId = orderIdMatch ? orderIdMatch[1] : null;

          // Sipariş zaten var mı kontrol et
          let existingOrder = null;
          
          if (orderId) {
            existingOrder = await Order.findById(orderId);
            if (!existingOrder && paymentDetail.buyer?.email) {
              // Email ile de ara
              const ordersByEmail = await Order.find({
                'customerInfo.email': paymentDetail.buyer.email
              }).lean();
              if (ordersByEmail.length > 0) {
                existingOrder = ordersByEmail[0];
              }
            }
          }

          // Sipariş yoksa oluştur
          if (!existingOrder) {
            const orderData = {
              userId: req.user?.id || null,
              photo: {
                filename: 'iyzico-tracked.jpg',
                originalName: 'iyzico-tracked.jpg',
                base64: null,
                mimetype: 'image/jpeg',
                size: 0
              },
              photos: [],
              size: '10x15', // Varsayılan
              customSize: undefined,
              quantity: 15, // Varsayılan
              frameType: 'none',
              paperType: 'glossy',
              colorMode: 'color',
              shippingType: 'standard',
              customerInfo: {
                firstName: paymentDetail.buyer?.name || 'Müşteri',
                lastName: paymentDetail.buyer?.surname || 'Müşteri',
                email: paymentDetail.buyer?.email || 'email@example.com',
                phone: paymentDetail.buyer?.gsmNumber || '',
                address: paymentDetail.buyer?.registrationAddress || 
                        paymentDetail.shippingAddress?.address || 
                        'Adres bilgisi yok'
              },
              price: parseFloat(paymentDetail.paidPrice || paymentDetail.price || 0),
              status: 'Ödeme Alındı',
              paymentStatus: 'paid',
              notes: `Iyzico'dan otomatik takip ile eklendi. Payment ID: ${paymentDetail.paymentId}, Conversation ID: ${paymentDetail.conversationId}`,
              createdAt: paymentDetail.createdDate ? new Date(paymentDetail.createdDate) : new Date(),
              updatedAt: new Date()
            };

            const savedOrder = await Order.create(orderData);
            syncedOrders.push({
              paymentId: paymentDetail.paymentId,
              orderId: savedOrder._id.toString(),
              email: orderData.customerInfo.email,
              price: orderData.price,
              action: 'created'
            });
            
            console.log(`✅ Sipariş eklendi: ${savedOrder._id} (Payment: ${paymentDetail.paymentId})`);
          } else {
            // Sipariş varsa güncelle
            const existingNotes = existingOrder.notes || '';
            await Order.findByIdAndUpdate(
              existingOrder._id,
              {
                paymentStatus: 'paid',
                status: 'Ödeme Alındı',
                notes: existingNotes ? 
                  `${existingNotes}\nIyzico takip güncellemesi: ${new Date().toISOString()}` : 
                  `Iyzico takip güncellemesi: ${new Date().toISOString()}`,
                updatedAt: new Date()
              },
              { new: true }
            );
            
            syncedOrders.push({
              paymentId: paymentDetail.paymentId,
              orderId: existingOrder._id.toString(),
              email: paymentDetail.buyer?.email,
              price: paymentDetail.paidPrice,
              action: 'updated'
            });
            
            console.log(`🔄 Sipariş güncellendi: ${existingOrder._id}`);
          }
        } catch (error) {
          console.error(`❌ Payment ${paymentId} işlenirken hata:`, error);
          errors.push({ paymentId, error: error.message });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Sipariş takibi tamamlandı`,
        summary: {
          total: paymentIds.length,
          synced: syncedOrders.length,
          skipped: skippedOrders.length,
          errors: errors.length
        },
        syncedOrders: syncedOrders,
        skippedOrders: skippedOrders.length > 0 ? skippedOrders : undefined,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // Tarih aralığı ile arama (Iyzico API'nin sınırlamaları nedeniyle manuel payment ID listesi daha iyi)
    if (startDate && endDate) {
      return res.status(400).json({
        success: false,
        error: 'Tarih aralığı desteği',
        message: 'Iyzico API tarih aralığı ile otomatik arama yapmayı desteklemiyor. Lütfen paymentIds array gönderin.'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Eksik bilgi',
      message: 'paymentIds array veya startDate/endDate gereklidir'
    });

  } catch (error) {
    console.error('❌ Sipariş takip hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş takibi başarısız',
      message: error.message
    });
  }
});

/**
 * Iyzico'dan ödeme arama - Payment Search API kullanarak (Admin için)
 */
router.post('/search', requireAdminRole, async (req, res) => {
  try {
    
    const { conversationId, paymentId, page = 1, pageSize = 10 } = req.body;
    
    if (!conversationId && !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'conversationId veya paymentId gereklidir'
      });
    }

    // Iyzico API
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || process.env.IYZIPAY_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY || process.env.IYZIPAY_SECRET_KEY,
      uri: process.env.IYZICO_URI || process.env.IYZIPAY_URI || 'https://api.iyzipay.com'
    });

    let searchResult = null;

    if (paymentId) {
      // Payment ID ile direkt ödeme bilgisi çek
      await new Promise((resolve, reject) => {
        iyzipay.payment.retrieve({ paymentId }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          searchResult = result;
          resolve(result);
        });
      });
    } else if (conversationId) {
      // Conversation ID ile arama
      await new Promise((resolve, reject) => {
        iyzipay.paymentSearch.create({
          locale: Iyzipay.LOCALE.TR,
          conversationId: conversationId,
          page: page,
          pageSize: pageSize
        }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          searchResult = result;
          resolve(result);
        });
      });
    }

    if (!searchResult || searchResult.status !== 'success') {
      return res.status(404).json({
        success: false,
        error: 'Ödeme bulunamadı',
        message: 'Iyzico\'da bu ödeme bulunamadı'
      });
    }

    res.json({
      success: true,
      payment: searchResult,
      message: 'Ödeme bilgisi başarıyla alındı'
    });

  } catch (error) {
    console.error('❌ Iyzico ödeme arama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Ödeme arama başarısız',
      message: error.message
    });
  }
});

/**
 * Kullanıcının siparişlerini Iyzico ile senkronize et
 */
router.post('/sync-user-orders', requireAuth, async (req, res) => {
  try {
    await connectDB();
    
    const { paymentIds } = req.body;
    
    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        message: 'paymentIds array gereklidir'
      });
    }

    // Iyzico API
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || process.env.IYZIPAY_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY || process.env.IYZIPAY_SECRET_KEY,
      uri: process.env.IYZICO_URI || process.env.IYZIPAY_URI || 'https://api.iyzipay.com'
    });
    const userId = req.user.id;
    const syncedOrders = [];
    const errors = [];

    for (const paymentId of paymentIds) {
      try {
        let paymentDetail = null;
        
        await new Promise((resolve) => {
          iyzipay.payment.retrieve({ paymentId: paymentId.trim() }, (err, result) => {
            if (err) {
              errors.push({ paymentId, error: err.message });
              resolve(null);
              return;
            }
            paymentDetail = result;
            resolve(result);
          });
        });

        if (!paymentDetail || paymentDetail.status !== 'success' || paymentDetail.paymentStatus !== 'SUCCESS') {
          continue;
        }

        // Sadece bu kullanıcıya ait ödemeleri işle
        const orderEmail = paymentDetail.buyer?.email;
        const userEmail = req.user.email;
        
        if (orderEmail && orderEmail.toLowerCase() !== userEmail.toLowerCase()) {
          continue; // Farklı kullanıcı, atla
        }

        // ConversationId'den orderId'yi çıkar
        const orderIdMatch = paymentDetail.conversationId?.match(/ORDER-(\d+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : null;

        // Sipariş zaten var mı kontrol et
        let existingOrder = null;
        
        if (orderId) {
          existingOrder = await Order.findById(orderId);
          if (existingOrder && existingOrder.userId && existingOrder.userId.toString() !== userId.toString()) {
            existingOrder = null; // Farklı kullanıcı, sıfırla
          }
          if (!existingOrder && orderEmail) {
            // Email ile de ara
            const ordersByEmail = await Order.find({
              userId: userId,
              'customerInfo.email': orderEmail
            }).lean();
            if (ordersByEmail.length > 0) {
              existingOrder = ordersByEmail[0];
            }
          }
        }

        // Sipariş yoksa oluştur
        if (!existingOrder) {
          const orderData = {
            userId: userId,
            photo: {
              filename: 'iyzico-sync.jpg',
              originalName: 'iyzico-sync.jpg',
              base64: null,
              mimetype: 'image/jpeg',
              size: 0
            },
            photos: [],
            size: '10x15',
            customSize: undefined,
            quantity: 15,
            frameType: 'none',
            paperType: 'glossy',
            colorMode: 'color',
            shippingType: 'standard',
            customerInfo: {
              firstName: paymentDetail.buyer?.name || 'Müşteri',
              lastName: paymentDetail.buyer?.surname || 'Müşteri',
              email: paymentDetail.buyer?.email || userEmail,
              phone: paymentDetail.buyer?.gsmNumber || '',
              address: paymentDetail.buyer?.registrationAddress || 
                      paymentDetail.shippingAddress?.address || 
                      'Adres bilgisi yok'
            },
            price: parseFloat(paymentDetail.paidPrice || paymentDetail.price || 0),
            status: 'Ödeme Alındı',
            paymentStatus: 'paid',
            notes: `Iyzico'dan kullanıcı senkronizasyonu ile eklendi. Payment ID: ${paymentDetail.paymentId}`,
            createdAt: paymentDetail.createdDate ? new Date(paymentDetail.createdDate) : new Date(),
            updatedAt: new Date()
          };

          const savedOrder = await Order.create(orderData);
          syncedOrders.push({
            paymentId: paymentDetail.paymentId,
            orderId: savedOrder._id.toString(),
            email: orderData.customerInfo.email,
            price: orderData.price
          });
        } else {
          // Sipariş varsa güncelle
          await Order.findByIdAndUpdate(
            existingOrder._id,
            {
              paymentStatus: 'paid',
              status: 'Ödeme Alındı',
              updatedAt: new Date()
            },
            { new: true }
          );
          
          syncedOrders.push({
            paymentId: paymentDetail.paymentId,
            orderId: existingOrder._id.toString(),
            action: 'updated'
          });
        }
      } catch (error) {
        console.error(`❌ Payment ${paymentId} işlenirken hata:`, error);
        errors.push({ paymentId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sipariş senkronizasyonu tamamlandı`,
      summary: {
        total: paymentIds.length,
        synced: syncedOrders.length,
        errors: errors.length
      },
      syncedOrders: syncedOrders,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Kullanıcı sipariş senkronizasyonu hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sipariş senkronizasyonu başarısız',
      message: error.message
    });
  }
});

export default router;
