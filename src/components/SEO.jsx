import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Her sayfa için dinamik meta taglar
 */
function SEO({ 
  title = 'Fotoğraf Kutusu - Profesyonel Fotoğraf Baskı ve Çerçeveleme',
  description = 'Yüksek kaliteli fotoğraf baskı, çerçeveleme ve özel boyut fotoğraf hizmetleri. Hızlı teslimat, uygun fiyatlar.',
  keywords = 'fotoğraf baskı, fotoğraf çerçeveleme, fotoğraf basım, fotoğraf kutusu, fotoğraf siparişi',
  image = 'https://fotograf-kutusu.onrender.com/og-image.jpg',
  url = 'https://fotograf-kutusu.onrender.com',
  type = 'website'
}) {
  const fullTitle = title.includes('Fotoğraf Kutusu') ? title : `${title} | Fotoğraf Kutusu`;
  const fullUrl = url.startsWith('http') ? url : `https://fotograf-kutusu.onrender.com${url}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}

export default SEO;
