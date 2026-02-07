import { sendWelcomeEmail, sendPasswordResetEmail } from './emailService.js';
import { connectDB } from '../config/database.js';
import User from '../models/UserSchema.js';

/**
 * Sipariş durumu değiştiğinde bildirim gönder
 */
export const sendOrderStatusNotification = async (userId, orderId, status, orderDetails) => {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };

    const notifications = [];

    // E-posta bildirimi
    if (user.notificationPreferences?.email?.orderStatus) {
      const emailResult = await sendOrderStatusEmail(
        user.email,
        user.firstName,
        orderId,
        status,
        orderDetails
      );
      if (emailResult.success) {
        notifications.push({ type: 'email', success: true });
      }
    }

    // SMS bildirimi (opsiyonel)
    if (user.notificationPreferences?.sms?.orderStatus && user.phone) {
      const smsResult = await sendSMS(
        user.phone,
        `Siparişiniz (${orderId.substring(0, 8)}) durumu: ${getStatusText(status)}`
      );
      if (smsResult.success) {
        notifications.push({ type: 'sms', success: true });
      }
    }

    // Push notification
    if (user.notificationPreferences?.push?.enabled && user.pushSubscription) {
      const pushResult = await sendPushNotification(
        user.pushSubscription,
        'Sipariş Durumu Güncellendi',
        `Siparişiniz durumu: ${getStatusText(status)}`,
        { orderId, status, url: `/profile?tab=orders` }
      );
      if (pushResult.success) {
        notifications.push({ type: 'push', success: true });
      }
    }

    return { success: true, notifications };
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Kargo gönderildiğinde bildirim gönder
 */
export const sendOrderShippedNotification = async (userId, orderId, trackingNumber, shippingCompany) => {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };

    const notifications = [];

    // E-posta bildirimi
    if (user.notificationPreferences?.email?.orderShipped) {
      const emailResult = await sendOrderShippedEmail(
        user.email,
        user.firstName,
        orderId,
        trackingNumber,
        shippingCompany
      );
      if (emailResult.success) {
        notifications.push({ type: 'email', success: true });
      }
    }

    // SMS bildirimi
    if (user.notificationPreferences?.sms?.orderShipped && user.phone) {
      const smsResult = await sendSMS(
        user.phone,
        `Siparişiniz kargoya verildi! Takip: ${trackingNumber}`
      );
      if (smsResult.success) {
        notifications.push({ type: 'sms', success: true });
      }
    }

    // Push notification
    if (user.notificationPreferences?.push?.enabled && user.pushSubscription) {
      const pushResult = await sendPushNotification(
        user.pushSubscription,
        'Siparişiniz Kargoya Verildi',
        `Takip No: ${trackingNumber}`,
        { orderId, trackingNumber, url: `/profile?tab=orders` }
      );
      if (pushResult.success) {
        notifications.push({ type: 'push', success: true });
      }
    }

    return { success: true, notifications };
  } catch (error) {
    console.error('Kargo bildirimi hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş teslim edildiğinde bildirim gönder
 */
export const sendOrderDeliveredNotification = async (userId, orderId) => {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };

    const notifications = [];

    // E-posta bildirimi
    if (user.notificationPreferences?.email?.orderDelivered) {
      const emailResult = await sendOrderDeliveredEmail(
        user.email,
        user.firstName,
        orderId
      );
      if (emailResult.success) {
        notifications.push({ type: 'email', success: true });
      }
    }

    // SMS bildirimi
    if (user.notificationPreferences?.sms?.orderDelivered && user.phone) {
      const smsResult = await sendSMS(
        user.phone,
        `Siparişiniz teslim edildi! Yorumunuzu bekliyoruz.`
      );
      if (smsResult.success) {
        notifications.push({ type: 'sms', success: true });
      }
    }

    // Push notification
    if (user.notificationPreferences?.push?.enabled && user.pushSubscription) {
      const pushResult = await sendPushNotification(
        user.pushSubscription,
        'Siparişiniz Teslim Edildi',
        'Siparişiniz başarıyla teslim edildi. Yorumunuzu bekliyoruz!',
        { orderId, url: `/reviews` }
      );
      if (pushResult.success) {
        notifications.push({ type: 'push', success: true });
      }
    }

    return { success: true, notifications };
  } catch (error) {
    console.error('Teslimat bildirimi hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * E-posta: Sipariş durumu
 */
const sendOrderStatusEmail = async (userEmail, firstName, orderId, status, orderDetails) => {
  try {
    const { createTransporter } = await import('./emailService.js');
    const transporter = createTransporter();
    
    const statusText = getStatusText(status);
    const statusColor = getStatusColor(status);

    const mailOptions = {
      from: `"Fotoğraf Kutusu" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Sipariş Durumu Güncellendi - ${statusText}`,
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; background: ${statusColor}; color: white; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📦 Sipariş Durumu Güncellendi</h1>
            <p>Merhaba ${firstName},</p>
            <p>Siparişinizin durumu güncellendi:</p>
            <div class="status-badge">${statusText}</div>
            <p><strong>Sipariş No:</strong> #${orderId.substring(0, 12)}</p>
            ${orderDetails ? `<p><strong>Toplam:</strong> ${orderDetails.price} ₺</p>` : ''}
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}/profile?tab=orders" class="button">
                Siparişi Görüntüle
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Sipariş durumu e-postası hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * E-posta: Kargo gönderildi
 */
const sendOrderShippedEmail = async (userEmail, firstName, orderId, trackingNumber, shippingCompany) => {
  try {
    const { createTransporter } = await import('./emailService.js');
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Fotoğraf Kutusu" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Siparişiniz Kargoya Verildi 🚚',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .tracking-box { background: #f0f9ff; border: 2px solid #0284c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚚 Siparişiniz Kargoya Verildi</h1>
            <p>Merhaba ${firstName},</p>
            <p>Siparişiniz kargoya verildi! Artık takip edebilirsiniz.</p>
            <div class="tracking-box">
              <p><strong>Sipariş No:</strong> #${orderId.substring(0, 12)}</p>
              <p><strong>Kargo Takip No:</strong> <span style="font-family: monospace; font-size: 1.2em; font-weight: bold;">${trackingNumber}</span></p>
              <p><strong>Kargo Firması:</strong> ${shippingCompany || 'Belirtilmemiş'}</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}/profile?tab=orders" class="button">
                Siparişi Takip Et
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Kargo e-postası hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * E-posta: Sipariş teslim edildi
 */
const sendOrderDeliveredEmail = async (userEmail, firstName, orderId) => {
  try {
    const { createTransporter } = await import('./emailService.js');
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Fotoğraf Kutusu" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Siparişiniz Teslim Edildi ✅',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .container { background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Siparişiniz Teslim Edildi</h1>
            <p>Merhaba ${firstName},</p>
            <p>Siparişiniz başarıyla teslim edildi! Umarız memnun kalmışsınızdır.</p>
            <p><strong>Sipariş No:</strong> #${orderId.substring(0, 12)}</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}/reviews" class="button">
                Yorum Yaz
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Teslimat e-postası hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * SMS gönder (opsiyonel - Twilio veya benzeri servis)
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // SMS servisi yoksa atla
    if (!process.env.SMS_ENABLED || process.env.SMS_ENABLED !== 'true') {
      console.log('📱 SMS gönderme devre dışı');
      return { success: true, skipped: true };
    }

    // Twilio veya başka bir SMS servisi entegrasyonu buraya eklenebilir
    // Şimdilik sadece log
    console.log(`📱 SMS gönderilecekti: ${phoneNumber} - ${message}`);
    
    // TODO: Twilio entegrasyonu
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });

    return { success: true, skipped: true, reason: 'SMS servisi henüz entegre edilmedi' };
  } catch (error) {
    console.error('SMS gönderme hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Push notification gönder
 */
const sendPushNotification = async (subscription, title, body, data = {}) => {
  try {
    // Web Push kütüphanesi gerekli
    // npm install web-push
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('🔔 Push notification ayarları bulunamadı');
      return { success: true, skipped: true, reason: 'VAPID keys yok' };
    }

    // Web Push entegrasyonu frontend'de yapılacak
    // Backend sadece subscription'ı kaydeder
    console.log(`🔔 Push notification gönderilecekti: ${title} - ${body}`);
    
    return { success: true, skipped: true, reason: 'Push notification frontend\'de işlenecek' };
  } catch (error) {
    console.error('Push notification hatası:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Durum metni
 */
const getStatusText = (status) => {
  const statusMap = {
    'Bekliyor': 'Bekliyor',
    'Alındı': 'Alındı',
    'Basıldı': 'Basıldı',
    'Kargoya Verildi': 'Kargoya Verildi',
    'Teslim Edildi': 'Teslim Edildi'
  };
  return statusMap[status] || status;
};

/**
 * Durum rengi
 */
const getStatusColor = (status) => {
  const colorMap = {
    'Bekliyor': '#3b82f6',
    'Alındı': '#10b981',
    'Basıldı': '#f59e0b',
    'Kargoya Verildi': '#8b5cf6',
    'Teslim Edildi': '#059669'
  };
  return colorMap[status] || '#667eea';
};

export { sendWelcomeEmail, sendPasswordResetEmail };
