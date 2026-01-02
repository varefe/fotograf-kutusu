import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function DeliveryReturns() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Teslimat ve İade Şartları</h1>
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <h2>Teslimat Koşulları</h2>
              
              <h3>1. Teslimat Süresi</h3>
              <p>
                Siparişleriniz, onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir. 
                Kargo teslimat süresi, adresinizin bulunduğu bölgeye göre 1-3 iş günü arasında değişmektedir.
              </p>

              <h3>2. Teslimat Ücreti</h3>
              <p>
                Kargo ücreti sipariş tutarına göre belirlenmektedir. Belirli tutarın üzerindeki 
                siparişlerde kargo ücretsizdir. Detaylı bilgi için sipariş sayfasındaki kargo 
                ücreti hesaplamasını kontrol edebilirsiniz.
              </p>

              <h3>3. Teslimat Adresi</h3>
              <p>
                Sipariş verirken belirttiğiniz adrese teslimat yapılır. Adres bilgilerinizin 
                doğru ve eksiksiz olması önemlidir. Yanlış adres bilgisi nedeniyle oluşan 
                gecikmelerden firmamız sorumlu değildir.
              </p>

              <h3>4. Teslimat Kontrolü</h3>
              <p>
                Ürünlerinizi teslim alırken mutlaka kontrol ediniz. Paket hasarlı veya eksik 
                ise kargo yetkilisine tutanak tutturarak bizimle iletişime geçiniz.
              </p>

              <h2>İade ve Değişim Koşulları</h2>

              <h3>1. İade Hakkı</h3>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Satış Sözleşmesi 
                Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde 
                cayma hakkınızı kullanabilirsiniz.
              </p>

              <h3>2. İade Koşulları</h3>
              <ul>
                <li>Ürünün kullanılmamış, hasarsız ve orijinal ambalajında olması gerekir</li>
                <li>Ürünün orijinal faturası ile birlikte iade edilmesi gerekir</li>
                <li>Kişiselleştirilmiş veya özel üretim ürünlerde iade hakkı bulunmamaktadır</li>
                <li>İade kargo ücreti müşteriye aittir</li>
              </ul>

              <h3>3. İade İşlem Süreci</h3>
              <p>
                İade talebinizi bize iletmeniz durumunda, onay sürecinden sonra iade kargo 
                bilgileri size iletilecektir. Ürününüz bize ulaştıktan sonra, inceleme 
                sürecinin ardından ödeme iadeniz 3-5 iş günü içinde yapılacaktır.
              </p>

              <h3>4. Değişim</h3>
              <p>
                Ürün değişimi için önce iade işlemi yapılır, ardından yeni ürün siparişi 
                oluşturulur. Değişim işlemlerinde kargo ücreti müşteriye aittir.
              </p>

              <h3>5. Hatalı/Defolu Ürün</h3>
              <p>
                Ürününüzde üretim hatası veya defo tespit edilmesi durumunda, kargo ücreti 
                firmamıza aittir ve ücretsiz değişim veya iade yapılır.
              </p>

              <h2>İletişim</h2>
              <p>
                İade ve değişim talepleriniz için lütfen bizimle iletişime geçiniz.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default DeliveryReturns







