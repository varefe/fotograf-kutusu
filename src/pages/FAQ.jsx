import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Icon from '../components/Icon'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqCategories = [
    {
      id: 'siparis',
      title: 'Sipariş İşlemleri',
      icon: 'shopping-cart',
      questions: [
        {
          q: 'Nasıl sipariş verebilirim?',
          a: 'Ana sayfadan istediğiniz fotoğraf boyutunu seçin, fotoğraflarınızı yükleyin (minimum 15 adet), sepete ekleyin ve ödeme sayfasından siparişinizi tamamlayın.'
        },
        {
          q: 'Minimum sipariş adedi nedir?',
          a: 'Her boyut için minimum 15 adet sipariş verebilirsiniz. 15 adet ve üzeri siparişlerde özel toplu fiyatlar geçerlidir.'
        },
        {
          q: 'Hangi boyutlarda fotoğraf baskı yapıyorsunuz?',
          a: '10x15, 13x18, 15x21, 20x30, 30x40, 30x45, 40x50, 50x70 ve 70x100 cm boyutlarında baskı yapıyoruz. Ayrıca özel boyut siparişleri de alıyoruz.'
        },
        {
          q: 'Siparişimi nasıl takip edebilirim?',
          a: 'Giriş yaptıktan sonra "Sipariş Takibi" sayfasından siparişlerinizi görüntüleyebilir ve durumlarını takip edebilirsiniz.'
        },
        {
          q: 'Siparişimi iptal edebilir miyim?',
          a: 'Siparişiniz henüz işleme alınmadıysa iptal edebilirsiniz. İptal işlemi için müşteri hizmetlerimizle iletişime geçin.'
        }
      ]
    },
    {
      id: 'odeme',
      title: 'Ödeme ve Fiyatlandırma',
      icon: 'credit-card',
      questions: [
        {
          q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
          a: 'Kredi kartı ve banka kartı ile güvenli ödeme yapabilirsiniz. Ödeme işlemleriniz Iyzico altyapısı ile korunmaktadır.'
        },
        {
          q: 'Fiyatlar nasıl belirleniyor?',
          a: 'Fiyatlar fotoğraf boyutuna ve adetine göre belirlenir. 15 adet ve üzeri siparişlerde toplu fiyat avantajı sağlanır.'
        },
        {
          q: 'Kargo ücreti ne kadar?',
          a: 'Sipariş tutarınıza göre kargo ücreti hesaplanır. Belirli tutarın üzerindeki siparişlerde ücretsiz kargo imkanı sunulmaktadır.'
        },
        {
          q: 'İndirim kuponu kullanabilir miyim?',
          a: 'Kampanya dönemlerinde geçerli kupon kodlarını ödeme sayfasında kullanabilirsiniz.'
        }
      ]
    },
    {
      id: 'teslimat',
      title: 'Teslimat ve Kargo',
      icon: 'truck',
      questions: [
        {
          q: 'Siparişim ne kadar sürede hazırlanır?',
          a: 'Siparişleriniz genellikle 2-3 iş günü içinde hazırlanır ve kargoya verilir.'
        },
        {
          q: 'Kargo süresi ne kadar?',
          a: 'Kargo süresi adresinize göre değişiklik göstermektedir. Türkiye genelinde ortalama 2-5 iş günü içinde teslimat yapılmaktadır.'
        },
        {
          q: 'Kargo takip numarasını nasıl alırım?',
          a: 'Siparişiniz kargoya verildiğinde e-posta adresinize kargo takip numarası gönderilir.'
        },
        {
          q: 'Hangi kargo firmasını kullanıyorsunuz?',
          a: 'Siparişinizin konumuna göre en uygun kargo firması seçilir. Genellikle Yurtiçi Kargo, Aras Kargo veya MNG Kargo kullanılmaktadır.'
        },
        {
          q: 'Adres değişikliği yapabilir miyim?',
          a: 'Siparişiniz henüz kargoya verilmediyse adres değişikliği yapabilirsiniz. Müşteri hizmetlerimizle iletişime geçin.'
        }
      ]
    },
    {
      id: 'fotograf',
      title: 'Fotoğraf ve Kalite',
      icon: 'image',
      questions: [
        {
          q: 'Hangi formatlarda fotoğraf yükleyebilirim?',
          a: 'JPG, JPEG, PNG formatlarında fotoğraf yükleyebilirsiniz. Fotoğraflarınız otomatik olarak optimize edilir.'
        },
        {
          q: 'Fotoğraf kalitesi nasıl?',
          a: 'Profesyonel baskı makineleri ve yüksek kaliteli kağıt kullanarak en iyi sonuçları sunuyoruz.'
        },
        {
          q: 'Fotoğraf boyutu sınırı var mı?',
          a: 'Hayır, fotoğraf boyutu sınırı yoktur. İstediğiniz kadar fotoğraf ekleyebilirsiniz.'
        },
        {
          q: 'Fotoğraflarım güvende mi?',
          a: 'Evet, tüm fotoğraflarınız şifrelenerek saklanır ve sadece sipariş işleme sürecinde kullanılır.'
        }
      ]
    },
    {
      id: 'iade',
      title: 'İade ve Değişim',
      icon: 'refresh',
      questions: [
        {
          q: 'Ürün iadesi yapabilir miyim?',
          a: 'Ürün hasarlı veya yanlış geldiyse 7 gün içinde iade edebilirsiniz. Detaylar için "Teslimat ve İade" sayfasına bakın.'
        },
        {
          q: 'İade süreci nasıl işler?',
          a: 'İade talebinizi müşteri hizmetlerimize bildirin. Onay sonrası kargo bilgileri paylaşılır ve iade işlemi tamamlanır.'
        },
        {
          q: 'İade ücreti kim tarafından karşılanır?',
          a: 'Ürün hatası veya hasarlı gelmesi durumunda kargo ücreti tarafımızca karşılanır.'
        }
      ]
    },
    {
      id: 'hesap',
      title: 'Hesap ve Güvenlik',
      icon: 'user',
      questions: [
        {
          q: 'Hesabımı nasıl oluştururum?',
          a: 'Sağ üst köşedeki "Kayıt Ol" butonuna tıklayarak ücretsiz hesap oluşturabilirsiniz.'
        },
        {
          q: 'Şifremi unuttum, ne yapmalıyım?',
          a: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı alabilirsiniz.'
        },
        {
          q: 'Hesap bilgilerimi nasıl güncelleyebilirim?',
          a: 'Giriş yaptıktan sonra "Profil" sayfasından hesap bilgilerinizi güncelleyebilirsiniz.'
        },
        {
          q: 'Hesabımı silebilir miyim?',
          a: 'Hesap silme talebiniz için müşteri hizmetlerimizle iletişime geçin.'
        }
      ]
    }
  ]

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <SEO 
        title="Sık Sorulan Sorular (SSS)"
        description="Fotoğraf Kutusu hakkında sık sorulan sorular ve cevapları. Sipariş, ödeme, teslimat, iade ve daha fazlası hakkında bilgi alın."
        keywords="fotoğraf kutusu sss, sık sorulan sorular, fotoğraf baskı soruları, sipariş soruları"
        url="/faq"
      />
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Sık Sorulan Sorular (SSS)</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.95 }}>
              Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz
            </p>
          </div>
        </div>

        <section className="content-section" style={{ padding: '3rem 0' }}>
          <div className="container">
            {faqCategories.map((category, categoryIndex) => (
              <div key={category.id} style={{ marginBottom: '3rem' }}>
                <h2 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  color: 'var(--primary-color)',
                  fontSize: '1.8rem'
                }}>
                  <Icon name={category.icon} size={24} />
                  {category.title}
                </h2>
                
                <div style={{ 
                  display: 'grid', 
                  gap: '1rem' 
                }}>
                  {category.questions.map((item, index) => {
                    const questionIndex = categoryIndex * 100 + index
                    const isOpen = openIndex === questionIndex
                    
                    return (
                      <div 
                        key={index}
                        style={{
                          background: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <button
                          onClick={() => toggleQuestion(questionIndex)}
                          style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--text-color)',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <span>{item.q}</span>
                          <Icon 
                            name={isOpen ? 'chevron-up' : 'chevron-down'} 
                            size={20}
                            style={{ 
                              color: 'var(--primary-color)',
                              transition: 'transform 0.3s',
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          />
                        </button>
                        
                        {isOpen && (
                          <div style={{
                            padding: '0 1.25rem 1.25rem 1.25rem',
                            color: 'var(--text-light)',
                            lineHeight: '1.8',
                            fontSize: '1rem',
                            borderTop: '1px solid #eee',
                            marginTop: '0.5rem',
                            paddingTop: '1rem',
                            animation: 'fadeIn 0.3s ease'
                          }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '2rem',
              marginTop: '3rem',
              textAlign: 'center',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                Sorunuz mu var?
              </h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', opacity: 0.9 }}>
                Aradığınız cevabı bulamadıysanız, bizimle iletişime geçmekten çekinmeyin!
              </p>
              <a 
                href="/contact" 
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default FAQ
