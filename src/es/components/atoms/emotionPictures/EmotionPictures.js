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
      :host {
        padding: var(--padding, 0);
      }
      :host([with-border]) {
        padding-left: 0;
        padding-right: 0;
      }
      
      .spickel_wrap {
        width:66.6666666667%;
        position: relative !important;
      }
      
      .arrow_wrap {
        display: flex;
        width: 100%;
        justify-content: center;
      }
      
      :host .spickel {
        position: absolute;
        top: var(--spickel-top-position, 15px);
      }

      @media screen and (max-width: 767px) {
        :host .spickel {
          left: calc(55% - 12px);
          border-top: 27px solid #fff;
          border-right: 12px solid transparent;
          border-left: 12px solid transparent;
          top: var(--spickel-top-position-mobile, 0);
        }
      }

      @media screen and (min-width: 768px) {
        :host .spickel {
          left: calc(35% - 19.5px);
          border-top: 39px solid #fff;
          border-right: 17.5px solid transparent;
          border-left: 17.5px solid transparent;
        }
      }

      @media screen and (min-width: 992px) {
        :host .spickel {
          left: calc(19% - 19.5px);
          border-top: 43px solid #fff;
          border-right: 19.5px solid transparent;
          border-left: 19.5px solid transparent;
        }
      }

      @media screen and (min-width: 1200px) {
        :host .spickel {
          left: calc(28.5% - 23px);
          border-top: 51px solid #fff;
          border-right: 23px solid transparent;
          border-left: 23px solid transparent;
        }
      }
      
      @media screen and (min-width: 1400px) {
        :host .spickel {
          left: calc(41.5% - 30px);
          border-top: 68px solid #fff;
          border-right: 30px solid transparent;
          border-left: 30px solid transparent;
        }
      }

       @media screen and (min-width: 1680px) {
        :host .spickel {
          left: calc(53% - 37px);
          border-top: 83px solid #fff;
          border-right: 37px solid transparent;
          border-left: 37px solid transparent;
        }
      }

      @media only screen and (max-width: _max-width_) {
        :host {
          padding: var(--padding-mobile, 0);
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
