// @ts-check
import EmotionPictures from '../../web-components-toolbox/src/es/components/atoms/emotionPictures/EmotionPictures.js'

export default class GastroEmotionPictures extends EmotionPictures {
  constructor (options = {}, ...args) {
    super({ ...options }, ...args)
  }

  connectedCallback () {
    super.connectedCallback()
  }

  renderCSS () {
    super.renderCSS()
    this.css = /* css */ `
      :host {}

      @media only screen and (max-width: _max-width_) {
        :host {
        }
      }
    `
    return this.fetchTemplate()
  }

  fetchTemplate () {
    const baseStyles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'emotion-pictures-corporate-':
        return this.fetchCSS({
          path: '/src/es/components/atoms/emotionPictures/corporate-/corporate-.css',
          namespace: false
        })
      default:
        return this.fetchCSS(baseStyles)
    }
  }

  renderHTML () {
    const fetchModules = this.fetchModules([
      {
        path: '/src/es/components/web-components-toolbox/src/es/components/atoms/picture/Picture.js',
        name: 'a-picture'
      }
    ])
    Promise.all([fetchModules])
  }
}
