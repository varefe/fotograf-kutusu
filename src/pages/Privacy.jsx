import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Privacy() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-header">
          <div className="container">
            <h1>Gizlilik Sözleşmesi</h1>
          </div>
        </div>

        <section className="content-section">
          <div className="container">
            <div className="content-wrapper">
              <p><strong>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</strong></p>

              <h2>1. Genel Bilgiler</h2>
              <p>
                Bu Gizlilik Sözleşmesi, web sitemiz üzerinden sağladığınız kişisel verilerinizin 
                toplanması, kullanılması, saklanması ve korunması ile ilgili hak ve yükümlülüklerimizi 
                açıklamaktadır. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca 
                kişisel verilerinizin korunmasına büyük önem vermekteyiz.
              </p>

              <h2>2. Toplanan Kişisel Veriler</h2>
              <p>Hizmetlerimizi sunabilmek için aşağıdaki kişisel verilerinizi toplamaktayız:</p>
              <ul>
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (gerekli durumlarda)</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres bilgileri</li>
                <li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri (iyzico ödeme sistemi üzerinden şifrelenmiş olarak işlenir)</li>
                <li><strong>İşlem Bilgileri:</strong> Sipariş geçmişi, ürün tercihleri</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgileri, çerezler</li>
              </ul>

              <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul>
                <li>Siparişlerinizin işlenmesi ve teslimatı</li>
                <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                <li>Müşteri hizmetleri ve destek sağlanması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Ürün ve hizmetlerimizin geliştirilmesi</li>
                <li>Pazarlama ve iletişim faaliyetleri (izin verilmesi durumunda)</li>
              </ul>

              <h2>4. Kişisel Verilerin Paylaşılması</h2>
              <p>
                Kişisel verileriniz, yasal yükümlülüklerimiz ve hizmetlerimizin sunulması için 
                gerekli olan durumlar dışında üçüncü kişilerle paylaşılmamaktadır. Ödeme işlemleri 
                için iyzico ödeme sistemi kullanılmakta olup, ödeme bilgileriniz güvenli bir şekilde 
                işlenmektedir.
              </p>

              <h2>5. Veri Güvenliği</h2>
              <p>
                Kişisel verilerinizin güvenliği için teknik ve idari önlemler almaktayız. 
                SSL sertifikası ile veri iletimi şifrelenmekte, verileriniz güvenli sunucularda 
                saklanmaktadır.
              </p>

              <h2>6. Çerezler (Cookies)</h2>
              <p>
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanılmaktadır. 
                Çerezler hakkında detaylı bilgi için tarayıcı ayarlarınızdan çerez politikasını 
                kontrol edebilirsiniz.
              </p>

              <h2>7. KVKK Kapsamındaki Haklarınız</h2>
              <p>KVKK uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme, yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
              </ul>

              <h2>8. Veri Saklama Süresi</h2>
              <p>
                Kişisel verileriniz, yasal saklama süreleri ve işleme amaçlarının gerektirdiği 
                süre boyunca saklanmaktadır. Bu süre sona erdiğinde verileriniz güvenli bir şekilde 
                silinmekte veya anonim hale getirilmektedir.
              </p>

              <h2>9. Değişiklikler</h2>
              <p>
                Bu Gizlilik Sözleşmesi, yasal düzenlemelerdeki değişiklikler veya iş süreçlerimizdeki 
                güncellemeler nedeniyle güncellenebilir. Güncellemeler web sitemizde yayınlanacaktır.
              </p>

              <h2>10. İletişim</h2>
              <p>
                KVKK kapsamındaki haklarınızı kullanmak veya gizlilik politikamız hakkında sorularınız 
                için bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Privacy







