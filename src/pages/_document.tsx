import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            .goog-te-banner-frame.skiptranslate { display: none !important; }
            body { top: 0px !important; }
            #google_translate_element { display: none !important; }
          `
        }} />
      </Head>
      <body className="antialiased">
        <div id="google_translate_element"></div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
