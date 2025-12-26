import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function DistanceSelling() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Mesafeli Satış Sözleşmesi</h1>
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <p><strong>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</strong></p>

              <h2>1. Taraflar</h2>
              <p>
                Bu sözleşme, aşağıda bilgileri yer alan satıcı ile internet sitesi üzerinden 
                sipariş veren alıcı arasında aşağıdaki şartlara göre düzenlenmiştir.
              </p>
              <p>
                <strong>Satıcı:</strong> Fotoğraf Baskı Hizmeti<br />
                <strong>Alıcı:</strong> Web sitesi üzerinden sipariş veren müşteri
              </p>

              <h2>2. Konu</h2>
              <p>
                Bu sözleşmenin konusu, alıcının satıcının web sitesinden satın aldığı fotoğraf 
                baskı ve çerçeveleme hizmeti ile ilgili tarafların hak ve yükümlülüklerinin 
                belirlenmesidir.
              </p>

              <h2>3. Sipariş ve Ödeme</h2>
              <h3>3.1. Sipariş Süreci</h3>
              <p>
                Alıcı, web sitesi üzerinden ürün seçimi yaparak sipariş oluşturur. Sipariş 
                onayı e-posta ile alıcıya iletilecektir.
              </p>

              <h3>3.2. Ödeme</h3>
              <p>
                Ödeme, iyzico güvenli ödeme sistemi üzerinden kredi kartı veya banka kartı 
                ile yapılabilir. Ödeme işlemi tamamlandıktan sonra sipariş onaylanır.
              </p>

              <h3>3.3. Fiyat</h3>
              <p>
                Ürün fiyatları, web sitesinde belirtilen fiyatlardır. KDV dahil fiyatlar 
                geçerlidir. Kargo ücreti sipariş tutarına göre belirlenir ve sipariş 
                sayfasında gösterilir.
              </p>

              <h2>4. Teslimat</h2>
              <h3>4.1. Teslimat Süresi</h3>
              <p>
                Siparişler, onaylandıktan sonra 3-5 iş günü içinde hazırlanır ve kargoya verilir. 
                Kargo teslimat süresi, adresinizin bulunduğu bölgeye göre 1-3 iş günü arasında 
                değişmektedir.
              </p>

              <h3>4.2. Teslimat Adresi</h3>
              <p>
                Ürünler, sipariş sırasında belirtilen teslimat adresine gönderilir. Adres 
                bilgilerinin doğru ve eksiksiz olması alıcının sorumluluğundadır.
              </p>

              <h3>4.3. Teslimat Kontrolü</h3>
              <p>
                Ürünlerinizi teslim alırken mutlaka kontrol ediniz. Paket hasarlı veya eksik 
                ise kargo yetkilisine tutanak tutturarak bizimle iletişime geçiniz.
              </p>

              <h2>5. Cayma Hakkı</h2>
              <h3>5.1. Cayma Hakkı Süresi</h3>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Satış Sözleşmesi 
                Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde 
                cayma hakkınızı kullanabilirsiniz.
              </p>

              <h3>5.2. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
              <p>Aşağıdaki durumlarda cayma hakkı kullanılamaz:</p>
              <ul>
                <li>Kişiselleştirilmiş veya özel üretim ürünler</li>
                <li>Müşterinin talebi doğrultusunda hazırlanan ve geri dönüşü olmayan ürünler</li>
                <li>Hızlı bozulabilir veya son kullanma tarihi geçmiş ürünler</li>
                <li>Açılmış ses veya görüntü kayıtları, yazılım programları</li>
              </ul>

              <h3>5.3. Cayma Hakkının Kullanılması</h3>
              <p>
                Cayma hakkınızı kullanmak için bizimle iletişime geçmeniz yeterlidir. İade 
                işlemi onaylandıktan sonra, ürününüzü orijinal ambalajında ve hasarsız olarak 
                göndermeniz gerekmektedir.
              </p>

              <h3>5.4. İade İşlemi</h3>
              <p>
                İade edilen ürünün kontrolünden sonra, ödeme iadeniz 3-5 iş günü içinde 
                yapılacaktır. İade kargo ücreti müşteriye aittir.
              </p>

              <h2>6. Garanti ve Sorumluluk</h2>
              <p>
                Satıcı, ürünlerin ayıpsız ve sözleşmeye uygun olarak teslim edilmesinden 
                sorumludur. Üretim hatası veya defo durumunda, ücretsiz değişim veya iade 
                yapılır.
              </p>

              <h2>7. Kişisel Verilerin Korunması</h2>
              <p>
                Kişisel verileriniz, 6698 sayılı KVKK uyarınca işlenmekte ve korunmaktadır. 
                Detaylı bilgi için Gizlilik Sözleşmesi sayfasını inceleyebilirsiniz.
              </p>

              <h2>8. Uyuşmazlıkların Çözümü</h2>
              <p>
                Bu sözleşmeden kaynaklanan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti 
                yasaları uygulanır. Uyuşmazlıklar öncelikle müzakere yoluyla çözülmeye 
                çalışılır, çözülemezse Türkiye Cumhuriyeti mahkemeleri yetkilidir.
              </p>

              <h2>9. Sözleşmenin Kabulü</h2>
              <p>
                Web sitesi üzerinden sipariş vermeniz, bu sözleşme şartlarını kabul ettiğiniz 
                anlamına gelmektedir.
              </p>

              <h2>10. İletişim</h2>
              <p>
                Sözleşme ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default DistanceSelling







