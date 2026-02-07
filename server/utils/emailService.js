import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// E-posta transporter oluştur
const createTransporter = () => {
  // Gmail için örnek yapılandırma
  // Production'da gerçek SMTP ayarlarınızı kullanın
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    },
    // Gmail için ek ayarlar
    ...(process.env.SMTP_HOST === 'smtp.gmail.com' && {
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
      }
    })
  });

  return transporter;
};

/**
 * Kayıt hoş geldin e-postası gönder
 */
export const sendWelcomeEmail = async (userEmail, firstName, lastName) => {
  try {
    // E-posta gönderme devre dışıysa (development) atla
    if (process.env.ENABLE_EMAIL !== 'true' && process.env.NODE_ENV !== 'production') {
      console.log('📧 E-posta gönderme devre dışı (development modu)');
      console.log(`📧 Hoş geldin e-postası gönderilecekti: ${userEmail}`);
      return { success: true, skipped: true };
    }

    // SMTP ayarları yoksa atla
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.warn('⚠️ SMTP ayarları bulunamadı, e-posta gönderilmedi');
      return { success: false, error: 'SMTP ayarları bulunamadı' };
    }

    const transporter = createTransporter();

    // E-posta içeriği
    const mailOptions = {
      from: `"Fotoğraf Kutusu" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Fotoğraf Kutusu\'na Hoş Geldiniz! 🎉',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #667eea;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #667eea;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
            .highlight {
              color: #667eea;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📸 Fotoğraf Kutusu</h1>
            </div>
            <div class="content">
              <p>Merhaba <span class="highlight">${firstName} ${lastName}</span>,</p>
              
              <p>Fotoğraf Kutusu ailesine hoş geldiniz! 🎉</p>
              
              <p>Hesabınız başarıyla oluşturuldu. Artık yüksek kaliteli fotoğraf baskı ve çerçeveleme hizmetlerimizden yararlanabilirsiniz.</p>
              
              <h3>Neler yapabilirsiniz?</h3>
              <ul>
                <li>✅ 10x15'ten 70x100'e kadar tüm boyutlarda fotoğraf baskı</li>
                <li>✅ Profesyonel çerçeveleme hizmetleri</li>
                <li>✅ Hızlı ve güvenli teslimat</li>
                <li>✅ Özel boyut fotoğraf siparişi</li>
                <li>✅ Toplu siparişlerde özel fiyatlar</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}" class="button">
                  Sipariş Vermeye Başla
                </a>
              </div>
              
              <p>Herhangi bir sorunuz veya öneriniz varsa, bizimle iletişime geçmekten çekinmeyin.</p>
              
              <p>İyi günler dileriz,<br>
              <strong>Fotoğraf Kutusu Ekibi</strong></p>
            </div>
            <div class="footer">
              <p>Bu e-posta ${userEmail} adresine kayıt işlemi sırasında otomatik olarak gönderilmiştir.</p>
              <p>© ${new Date().getFullYear()} Fotoğraf Kutusu. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Merhaba ${firstName} ${lastName},
        
        Fotoğraf Kutusu ailesine hoş geldiniz!
        
        Hesabınız başarıyla oluşturuldu. Artık yüksek kaliteli fotoğraf baskı ve çerçeveleme hizmetlerimizden yararlanabilirsiniz.
        
        Sipariş vermek için: ${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}
        
        İyi günler dileriz,
        Fotoğraf Kutusu Ekibi
      `
    };

    // E-postayı gönder
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Hoş geldin e-postası gönderildi:', {
      to: userEmail,
      messageId: info.messageId
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error);
    // E-posta hatası kayıt işlemini engellememeli
    return { success: false, error: error.message };
  }
};

/**
 * Şifre sıfırlama e-postası gönder
 */
export const sendPasswordResetEmail = async (userEmail, resetToken, firstName) => {
  try {
    // SMTP ayarları yoksa kontrol et
    const hasSmtpConfig = !!(process.env.SMTP_USER || process.env.EMAIL_USER);
    const isProduction = process.env.NODE_ENV === 'production';
    const emailEnabled = process.env.ENABLE_EMAIL === 'true';

    // E-posta gönderme devre dışıysa (development) ve SMTP yoksa atla
    if (!isProduction && !emailEnabled && !hasSmtpConfig) {
      console.log('📧 E-posta gönderme devre dışı (development modu, SMTP ayarları yok)');
      console.log(`📧 Şifre sıfırlama e-postası gönderilecekti: ${userEmail}`);
      console.log(`🔑 Reset Token: ${resetToken}`);
      console.log(`💡 E-posta göndermek için .env dosyasına SMTP ayarlarını ekleyin`);
      return { success: true, skipped: true, reason: 'SMTP ayarları yok' };
    }

    // SMTP ayarları yoksa uyarı ver ama devam et (production'da hata döndür)
    if (!hasSmtpConfig) {
      if (isProduction) {
        console.error('❌ Production modunda SMTP ayarları bulunamadı!');
        return { success: false, error: 'SMTP ayarları bulunamadı' };
      } else {
        console.warn('⚠️ SMTP ayarları bulunamadı, e-posta gönderilemedi');
        console.log(`📧 Şifre sıfırlama e-postası gönderilecekti: ${userEmail}`);
        console.log(`🔑 Reset Token: ${resetToken}`);
        return { success: false, error: 'SMTP ayarları bulunamadı', skipped: true };
      }
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'https://fotograf-kutusu.onrender.com'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Fotoğraf Kutusu" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Şifre Sıfırlama - Fotoğraf Kutusu',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #667eea;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Şifre Sıfırlama</h1>
            </div>
            <div class="content">
              <p>Merhaba ${firstName || 'Kullanıcı'},</p>
              
              <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Şifremi Sıfırla
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Önemli:</strong>
                <ul>
                  <li>Bu bağlantı 1 saat içinde geçerlidir</li>
                  <li>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz</li>
                  <li>Güvenliğiniz için bağlantıyı kimseyle paylaşmayın</li>
                </ul>
              </div>
              
              <p>Alternatif olarak, aşağıdaki bağlantıyı tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <p>İyi günler dileriz,<br>
              <strong>Fotoğraf Kutusu Ekibi</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // E-postayı gönder
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Şifre sıfırlama e-postası gönderildi:', {
      to: userEmail,
      messageId: info.messageId,
      resetUrl: resetUrl
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Şifre sıfırlama e-postası gönderme hatası:', error);
    console.error('Hata detayları:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Development modunda token'ı logla
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Reset Token (hata durumunda): ${resetToken}`);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * SMTP bağlantısını test et
 */
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP bağlantısı başarılı');
    return { success: true };
  } catch (error) {
    console.error('❌ SMTP bağlantı hatası:', error);
    return { success: false, error: error.message };
  }
};
