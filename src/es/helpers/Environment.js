/* global self */
/* global location */

const currentScriptUrl = new URL(document.currentScript.src)

// @ts-ignore
self.Environment = {
  isTestingEnv: location.hostname === 'localhost' || location.hostname.includes('.local') || location.hostname.includes('umb.') || location.hostname.includes('test.') || location.hostname.includes('testadmin.'),
  language: currentScriptUrl.searchParams.get('language') || document.documentElement.getAttribute('lang') || 'de',
  mcsBaseUrl: currentScriptUrl.searchParams.get('mcsBaseUrl') || 'https://digital-campaign-factory.migros.ch',
  mcsVersion: currentScriptUrl.searchParams.get('mcsVersion'), /* || 'v1.112.3', // the newest version gets fetched if this parameter is not set */
  mobileBreakpoint: ({ constructor, tagName, namespace } = {}) => {
    switch (true) {
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Header'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Logo'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Navigation'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('LanguageSwitcher'):
      case tagName && typeof tagName.includes === 'function' && tagName.includes('O-NAV-WRAPPER'):
      case tagName && typeof tagName.includes === 'function' && tagName.includes('KS-O-BODY-SECTION'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Login'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('CarouselTwo') && (namespace === 'carousel-two-teaser-' || namespace === 'carousel-two-3-column-'):
      case tagName && typeof tagName.includes === 'function' && tagName.includes('KS-M-STAGE'):
        return '1020px'
      default:
        return '767px'
    }
  }
}
