// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class MapOfCooperatives
* @type {CustomElementConstructor}
*/
export default class MapOfCooperatives extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    // @ts-ignore
    this.inputFieldEventListener = event => {
      // @ts-ignore
      const query = this.inputField.value
      if (query.length >= 4) {
        this.fetchLocations(query)
          .then(data => {
            const filteredData = data.filter(location => {
              return location.localityName.toLowerCase().includes(query.toLowerCase()) ||
                location.zip.toString().includes(query)
            })
            this.displaySuggestions(filteredData)
          })
          .catch(error => {
            console.error("Error fetching locations:", error)
          })
      } else {
        this.clearSuggestions()
      }
    }

    this.resetButtonEventListener = () => {
      // @ts-ignore
      this.inputField.value = ""
      this.clearSuggestions()
    }

  }

  connectedCallback() {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))

    this.inputFieldListener = this.inputField.addEventListener("input", this.inputFieldEventListener)
    this.resetButtonListener = this.buttonReset.addEventListener("click", this.resetButtonEventListener)
    this.suggestionsContainerEventListener = this.suggestionsContainer.addEventListener("mouseover", event => {
      // @ts-ignore
      if (event.target.classList.contains("autocomplete-suggestion")) {
        const selected = this.suggestionsContainer.querySelector(".autocomplete-selected")
        if (selected) {
          selected.classList.remove("autocomplete-selected")
        }
        // @ts-ignore
        event.target.classList.add("autocomplete-selected")
      }
    })
    this.enterFormButtonEventListener = this.enterFormButton.addEventListener("click", () => {
      this.cooperativeInput.classList.remove("is-hidden")
      this.cooperativeDisplay.classList.add("is-hidden")
      this.clearSuggestions()
    })
  }

  disconnectedCallback() {
    this.inputField.removeEventListener("input", this.inputFieldEventListener)
    this.buttonReset.removeEventListener("click", this.resetButtonEventListener)
    // @ts-ignore
    this.suggestionsContainer.removeEventListener("mouseover", this.suggestionsContainerEventListener)
    // @ts-ignore
    this.enterFormButton.removeEventListener("click", this.enterFormButtonEventListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.div
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS() {
    this.css = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate() {
    /** @type {import("../../web-components-toolbox/src/es/components/prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../web-components-toolbox/src/css/reset.css`,
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../web-components-toolbox/src/css/style.css`,
        namespaceFallback: true
      },
      {
        path: `${this.importMetaUrl}assets/styles.css`,
        namespace: false
      },
      {
        path: `${this.importMetaUrl}assets/components.css`,
        namespace: false
      },
      {
        path: `${this.importMetaUrl}assets/print.css`,
        namespace: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'map-of-cooperatives-default-':
        return this.fetchCSS([
          {
            path: `${this.importMetaUrl}default-/default-.css`,
            namespace: false
          },
          ...styles], false)
      default:
        return this.fetchCSS(styles)
    }
  }

  // @ts-ignore
  fetchLocations(query) {
    // const endpoint = "http://localhost:3002/searchLocalities"
    const endpoint = "https://testadmin.gastro.migros.ch/api/Cooperative/GetCooperative?plzOrt="
    const headers = { "accept": "application/json" }

    return new Promise((resolve, reject) => {
      fetch(endpoint, {
        method: "GET",
        headers: headers
      })
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok")

          return response.json()
        })
        .then(data => {
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML() {

    this.html = /* html */`
       <main>
            <div class="container-fluid">

                <div class="row" style="margin:0;">
                    <div style="padding:0;" class="col-xs-12 col-ms-12 col-sm-12 col-md-12 col-lg-12">
                        <h2 class="ui-paragraph-headline is-highlight">Gastronomische Angebote der Region</h2>
                    </div>
                </div>
                <div class="row" style="margin:0;">
                    <div style="padding:0;" class="col-xs-12 col-ms-12 col-sm-12 col-md-8 col-lg-6">
                        <p class="map-intro" style="font-weight: bold;">Die Genossenschaften der Migros verwöhnen dich täglich aufs Neue.</p>
                    </div>
                </div>

                <!-- Input Search + Output Location/State -->
                <div class="ui-c204-12-map">
                    <div id="cooperative-input" class="row ui-f607-12-forms ui-js-form ui-js-form-logic" style="margin: 0; height: 0; overflow: visible;">
                        <form method="get" action="#">
                            <div class="form-group">
                                <div class="search-container col-xs-12" style="padding:0; width: 100%; max-width: 312px;">
                                    <label for="ref-address" class="sr-only">PLZ oder Ort eingeben</label>
                                    <input 
                                        type="text" 
                                        aria-live="polite" 
                                        aria-controls="ui-autocomplete-ref-address" 
                                        class="form-control search-question js-association-search-input" 
                                        id="ref-address" 
                                        name="ref-address" 
                                        placeholder="PLZ oder Ort eingeben" 
                                        autocomplete="off"
                                    >
                                    <button class="button-reset" type="reset">
                                        <span class="sr-only">Zurücksetzen</span>
                                    </button>
                                    <button class="button-search" type="button">
                                        <span class="sr-only">Suchen</span>
                                    </button>
                                    <div class="ui-results-autocomplete ui-js-results-autocomplete" id="ui-autocomplete-ref-address">
                                        <div class="autocomplete-suggestions" style="position: absolute; display: none; max-height: 300px; z-index: 9999; width: 312px;">
                                            <div class="autocomplete-suggestion" data-index="0">1144 <strong>B</strong>allens</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div id="cooperative-display" class="ui-js-output-search ui-output-search is-hidden">
                        <div class="ui-output-search-item">
                            Ihr Standort:
                            <button id="enter-form-button" class="ui-output-plz" type="button">
                                PLZ <span class="ui-js-output-plz">8000</span>
                            </button>
                        </div>
                        <div class="ui-output-search-item">
                            Ihre Genossenschaft:
                            <a class="ui-js-output-state ui-output-state" href="/de/genossenschaften/zuerich.html">Migros Zürich</a>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 2em;"></div>

                <div class="ui-c204-12-map ui-js-association-map ui-js-association-map-marker is-inverted">
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="image-animation">
                                <div class="map js-association-map is-touched">
                                    <object 
                                      type="image/svg+xml" 
                                      class="js-association-map-svg img-responsive"
                                      data="../assets/MGB_RB_Broschuere_karte.svg"
                                    ></object>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="aa"
                                        data-area-url="/author/gastro/de/genossenschaften/aare.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Aare&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/aare.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 36%; left: 35%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="A">A</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="bs"
                                        data-area-url="/author/gastro/de/genossenschaften/basel.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Basel&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/basel.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 8%; left: 33%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="B">B</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="ge"
                                        data-area-url="/author/gastro/fr/cooperatives/geneve.html" data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Genf&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr (französisch).&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/fr/cooperatives/geneve.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 63%; left: 2%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="G">G</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="lu"
                                        data-area-url="/author/gastro/de/genossenschaften/luzern.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Luzern&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/luzern.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 31%; left: 53%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="L">L</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="nf"
                                        data-area-url="/author/gastro/fr/cooperatives/neuchatel-fribourg.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Neuenburg-Freiburg&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr (französisch).&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/fr/cooperatives/neuchatel-fribourg.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 23%; left: 21%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="N-F">N-F</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="os"
                                        data-area-url="/author/gastro/de/genossenschaften/ostschweiz.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Ostschweiz&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/ostschweiz.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 48%; left: 78%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="O">O</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="ti"
                                        data-area-url="https://www.migrosticino.ch/ristorante-take-away/"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Tessin&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr (italienisch).&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;https://www.migrosticino.ch/ristorante-take-away/&quot; class=&quot;link&quot; target=&quot;_bank&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 64%; left: 61%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="T">T</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="vd"
                                        data-area-url="/author/gastro/fr/cooperatives/vaud.html" data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Waadt&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr (französisch).&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/fr/cooperatives/vaud.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 45%; left: 11%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="W">W</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="vs"
                                        data-area-url="/author/gastro/de/genossenschaften/wallis.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Wallis&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/wallis.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 68%; left: 33%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="W">W</span>
                                    </span>
                                    <span class="map-marker ui-js-popover js-map-popover" 
                                        data-map-area="zh"
                                        data-area-url="/author/gastro/de/genossenschaften/zuerich.html"
                                        data-toggle="popover"
                                        data-setup="{&quot;documentClose&quot;: true, &quot;popoverClasses&quot;: &quot;is-map&quot;}"
                                        data-trigger="manual" data-placement="top"
                                        data-content="&lt;h2 class=&quot;title&quot;&gt;Migros Zürich&lt;/h2&gt;&lt;span class=&quot;text&quot;&gt;&lt;span&gt;Hier findest du den Menüplan der Woche, Migros-Take-Away-Angebote, Catering Services und vieles mehr.&lt;/span&gt;&lt;/span&gt;&lt;div class=&quot;link-wrapper&quot;&gt;&lt;a href=&quot;/author/gastro/de/genossenschaften/zuerich.html&quot; class=&quot;link&quot;&gt;zur Genossenschaft&lt;/a&gt;&lt;/div&gt;"
                                        style="top: 22%; left: 65%;" data-original-title="" title="">
                                        <span class="map-marker-abbreviation" data-abbreviation="Z">Z</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
        <script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js"></script>
        <script defer="" src="${this.importMetaUrl}assets/jquery.js" type="text/javascript"></script>
        <script defer="" src="${this.importMetaUrl}assets/jquery-migrate.min.js" type="text/javascript"></script>
        <script defer="" src="${this.importMetaUrl}assets/exoskeleton.js" type="text/javascript"></script>
        <script defer="" src="${this.importMetaUrl}assets/lazysizes.js" type="text/javascript"></script>
        <script defer="" src="${this.importMetaUrl}assets/immediate.min.js" type="text/javascript"></script>
        <script src="${this.importMetaUrl}assets/main.js" type="text/javascript"></script>
        <script defer="" src="${this.importMetaUrl}assets/main.min.js" type="text/javascript"></script>
        <script>
          window.ui = window.ui || {}
        </script>
        `
  }

  displaySuggestions = (locations) => {
    const suggestionsContainer = this.suggestionsContainer
    suggestionsContainer.innerHTML = ""
    locations.forEach(location => {
      const suggestion = document.createElement("div")
      suggestion.classList.add("autocomplete-suggestion")
      suggestion.setAttribute("data-index", location.id)
      suggestion.innerHTML = `<strong>${location.zip}</strong> ${location.localityName}`
      suggestion.addEventListener("click", () => {
        // @ts-ignore
        this.inputField.value = suggestion.textContent
        this.displayCooperative(location)
        this.clearSuggestions()
      })
      suggestionsContainer.appendChild(suggestion)
    })
    suggestionsContainer.style.display = "block"
  }

  clearSuggestions = () => {
    const suggestionsContainer = this.suggestionsContainer
    suggestionsContainer.innerHTML = ""
    suggestionsContainer.style.display = "none"
  }

  displayCooperative = (location) => {
    const cooperativeInput = this.cooperativeInput
    cooperativeInput.classList.add("is-hidden")
    const cooperativeDisplay = this.cooperativeDisplay
    cooperativeDisplay.classList.remove("is-hidden")
    const plzElement = cooperativeDisplay.querySelector(".ui-js-output-plz")
    const stateElement = cooperativeDisplay.querySelector(".ui-js-output-state")
    // @ts-ignore
    plzElement.textContent = location.zip
    // @ts-ignore
    stateElement.textContent = location.localityName
    // @ts-ignore
    stateElement.setAttribute("href", `/de/genossenschaften/${location.economicAreaId}.html`)
  }

  /**
   * @returns {HTMLElement}
   */
  get inputField() {
    return this.root.querySelector('#ref-address')
  }
  /**
   * @returns {HTMLElement}
   */
  get cooperativeInput() {
    return this.root.querySelector('#cooperative-input')
  }
  /**
   * @returns {HTMLElement}
   */
  get cooperativeDisplay() {
    return this.root.querySelector('#cooperative-display')
  }
  /**
   * @returns {HTMLElement}
   */
  get suggestionsContainer() {
    return this.root.querySelector('.autocomplete-suggestions')
  }
  /**
   * @returns {HTMLElement}
   */
  get buttonReset() {
    return this.root.querySelector('.button-reset')
  }
  /**
   * @returns {HTMLElement}
   */
  get buttonSearch() {
    return this.root.querySelector('.button-search')
  }
  /**
   * @returns {HTMLElement}
   */
  get enterFormButton() {
    return this.root.querySelector('#enter-form-button')
  }
  /**
   * @returns {HTMLElement}
   */
  get map() {
    return this.root.querySelector('.js-association-map')
  }
  /**
   * @returns {HTMLElement}
   */
  get mapMarker() {
    return this.root.querySelector('.map-marker')
  }

  get div() {
    return this.root.querySelector('div')
  }
}
