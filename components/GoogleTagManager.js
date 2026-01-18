// components/GoogleTagManager.js
import Script from "next/script";

const GoogleTagManager = () => {
  return (
    <>
      {/* Google Tag Manager (Global Site Tags) for Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-D3BJK0K1HT"
      />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-5ZNEHLMMCH"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D3BJK0K1HT');
            gtag('config', 'G-5ZNEHLMMCH');
          `,
        }}
      />

      {/* Google Tag Manager Script for GTM-N6T8CNJT */}
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6T8CNJT');
          `,
        }}
      />

      {/* <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1357734920137025"
        crossOrigin="anonymous"
      ></script> */}
    </>
  );
};

export default GoogleTagManager;
