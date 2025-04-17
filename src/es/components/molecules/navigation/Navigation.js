// @ts-check
import Navigation from '../../web-components-toolbox/src/es/components/molecules/navigation/Navigation.js'

export default class NavigationDefault extends Navigation {
  constructor (options = {}, ...args) {
    super({ ...options }, ...args)
  }

  connectedCallback () {
    super.connectedCallback()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
  }

  /**
   * renders the m-navigation css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    super.renderCSS()
    this.css = /* css */`
      :host{}
      
      @media only screen and (max-width: _max-width_) {
        :host {}
        
      }
    `
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    switch (this.getAttribute('namespace')) {
      case 'navigation-default-':
        return this.fetchCSS([{
          path: '/src/es/components/molecules/navigation/default-/default-.css', // apply namespace since it is specific and no fallback
          namespace: false
        }], false)

      default:
        return Promise.resolve()
    }
  }
}
