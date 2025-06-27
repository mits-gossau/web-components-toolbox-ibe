// gastro.js

const fallbackApiUrl = "https://testadmin.gastro.migros.ch"
let domain = window.location.origin || fallbackApiUrl
if (domain.includes("localhost")) domain = fallbackApiUrl
const path = "/api/Cooperative/GetCooperative"
const endpoint = domain + path
const headers = { "accept": "application/json" }

const fetchLocations = (query) => {
    const requestUrl = new URL(endpoint)
    requestUrl.searchParams.append("plzOrt", query)

    return new Promise((resolve, reject) => {
        fetch(requestUrl, {
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

const isValidQuery = (query) => (query.length > 3 && /^\d{1,4}$/.test(query) && query.length <= 4) || (query.length > 1 && /\D/.test(query))

const inputField = document.querySelector("#ref-address")
const resetButton = document.querySelector(".button-reset")
const lang = document.documentElement.getAttribute("lang") || "de"
let t
const subdomain = inputField.getAttribute("subdomain") || "gastro"
const errorMessage = document.createElement("div")
errorMessage.className = "input-error-message"
errorMessage.style.color = "red"
errorMessage.style.marginTop = "4px"
inputField.parentNode.insertBefore(errorMessage, inputField.nextSibling)

// translations.json laden und anwenden
fetch('../assets/translations.json')
    .then(res => res.json())
    .then(translations => {
        t = translations[lang] || translations['de']

        // Headline
        document.title = t.headline
        const headline = document.querySelector('.ui-paragraph-headline')
        if (headline) headline.textContent = t.headline

        // Intro
        const intro = document.querySelector('.map-intro')
        if (intro) intro.textContent = t.intro

        // Input Label & Placeholder
        const input = document.getElementById('ref-address')
        if (input) {
            input.setAttribute('placeholder', t.input_placeholder)
            input.setAttribute('error-message', t.input_error)
        }
        const label = document.querySelector('label[for="ref-address"]')
        if (label) label.textContent = t.input_label

        // Buttons
        const resetBtn = document.querySelector('.button-reset .sr-only')
        if (resetBtn) resetBtn.textContent = t.reset_button
        const searchBtn = document.querySelector('.button-search .sr-only')
        if (searchBtn) searchBtn.textContent = t.search_button

        // Output
        const locationLabel = document.querySelector('.ui-output-search-item')
        if (locationLabel) locationLabel.childNodes[0].textContent = t.your_location

        const coopLabel = document.querySelectorAll('.ui-output-search-item')[1]
        if (coopLabel) coopLabel.childNodes[0].textContent = t.your_cooperative

        // Popover
        const mapMarkers = document.querySelectorAll('.map-marker')
        fetch('../assets/cooperatives.json')
            .then(res => res.json())
            .then(cooperatives => {
                mapMarkers.forEach(marker => {
                    const area = marker.getAttribute("data-map-area")
                    if (area && t.popover[area]) {
                        const coop = cooperatives.find(c => c.short === area)
                        let url = ''
                        if (coop && coop.slug && coop.slug[subdomain]) {
                            let slugValue = coop.slug[subdomain][lang] || coop.slug[subdomain].de
                            if (slugValue) url = slugValue.startsWith("https://") ? slugValue : `/${slugValue}`
                        }
                        const popoverContent = /*html*/`
                            <h2 class="title">${t.popover[area].title}</h2>
                            <span class="text"><span>${t.popover[area].desc}</span></span>
                            <div class="link-wrapper">
                                <a target="_parent" href="${url}" class="link">${t.to_cooperative}</a>
                            </div>
                        `
                        marker.setAttribute('data-content', popoverContent)
                        marker.setAttribute('data-area-url', url)
                    }
                })
            })
    })

const showError = (msg) => {
    const customMsg = inputField.getAttribute("error-message") || "Please enter a valid zip code."
    errorMessage.textContent = msg || customMsg
    errorMessage.style.display = "block"
}
const hideError = () => {
    errorMessage.textContent = ""
    errorMessage.style.display = "none"
}

inputField.addEventListener("input", function () {
    let query = this.value.trim()
    hideError()
    if (query.length > 0) {
        resetButton.style.visibility = "visible"
        resetButton.style.opacity = "1"
    } else {
        resetButton.style.visibility = "hidden"
        resetButton.style.opacity = "0"
    }
    if (/^\d+$/.test(query) && query.length > 4) {
        query = query.slice(0, 4)
        this.value = query // update input field visually
    }
    if (isValidQuery(query)) {
        fetchLocations(query)
            .then(data => getCooperative(data.result, query))
            .catch(error => {
                showError()
                clearSuggestions()
            })
    } else {
        clearSuggestions()
        hideError()
    }
})

const searchButton = document.querySelector(".button-search")
searchButton.addEventListener("click", function () {
    let query = inputField.value.trim()
    hideError()
    if (isValidQuery(query)) {
        fetchLocations(query)
            .then(data => getCooperative(data.result, query))
            .catch(error => {
                showError()
                clearSuggestions()
            })
    } else {
        clearSuggestions()
        hideError()
    }
})

resetButton.addEventListener("click", function () {
    inputField.value = ""
    clearSuggestions()
    resetButton.style.visibility = "hidden"
    resetButton.style.opacity = "0"
})

const getCooperative = (result, query) => {
    let gm = ''
    if (result.startsWith("gm")) {
        gm = result.substring(2)
        const cooperativesJSON = fetch("../assets/cooperatives.json")
        cooperativesJSON
            .then(response => response.json())
            .then(items => {
                const coop = items.find(item => item.short === gm)
                if (coop) displayPopover(coop, query)
            })
    } else if (Array.isArray(JSON.parse(result))) {
        try {
            displaySuggestions(JSON.parse(result))
        } catch (e) {
            console.error("Error parsing JSON:", e)
            return
        }
    }
}

const enterFormButton = document.querySelector("#enter-form-button")
enterFormButton.addEventListener("click", function () {
    const cooperativeInput = document.querySelector("#cooperative-input")
    cooperativeInput.classList.remove("is-hidden")
    const cooperativeDisplay = document.querySelector("#cooperative-display")
    cooperativeDisplay.classList.add("is-hidden")
})

const suggestionsContainer = document.querySelector(".autocomplete-suggestions")

const displaySuggestions = (locations) => {
    suggestionsContainer.innerHTML = ""
    locations.forEach(location => {
        const suggestion = document.createElement("div")
        suggestion.classList.add("autocomplete-suggestion")
        suggestion.setAttribute("data-index", location.zip)
        suggestion.innerHTML = `<strong>${location.zip}</strong> ${location.city}`
        suggestion.addEventListener("click", function () {
            inputField.value = this.textContent
            displayPopover(location)
            clearSuggestions()
        })
        suggestionsContainer.appendChild(suggestion)
    })
    suggestionsContainer.style.display = "block"
}

suggestionsContainer.addEventListener("mouseover", function (event) {
    if (event.target.classList.contains("autocomplete-suggestion")) {
        const selected = document.querySelector(".autocomplete-selected")
        if (selected) selected.classList.remove("autocomplete-selected")
        event.target.classList.add("autocomplete-selected")
    }
})

const clearSuggestions = () => {
    suggestionsContainer.innerHTML = ""
    suggestionsContainer.style.display = "none"
}

const displayPopover = (coop, query = undefined) => {
    let gm = coop.short || coop.cooperative
    if (gm.startsWith("gm")) gm = gm.substring(2)
    let gmZip = coop.zip
    if (/^\d{4}$/.test(query)) gmZip = query
    let gmLabel = coop.label

    const cooperativesJSON = fetch("../assets/cooperatives.json")
    cooperativesJSON
        .then(response => response.json())
        .then(items => {
            const coop = items.find(item => item.short === gm)
            if (coop) {
                gmLabel = coop.label
                const cooperativeInput = document.querySelector("#cooperative-input")
                cooperativeInput.classList.add("is-hidden")
                const cooperativeDisplay = document.querySelector("#cooperative-display")
                cooperativeDisplay.classList.remove("is-hidden")
                const plzButton = cooperativeDisplay.querySelector(".ui-output-plz")
                const plzElement = cooperativeDisplay.querySelector(".ui-js-output-plz")
                if (gmZip === undefined || gmZip === "") {
                    gmZip = gmLabel.replace("Migros ", "")
                    if (plzButton) plzButton.textContent = gmZip
                } else {
                    if (plzElement) plzElement.textContent = gmZip
                }
                const stateElement = cooperativeDisplay.querySelector(".ui-js-output-state")
                const url = (lang === 'de' || !lang) ? `/${coop.slug[subdomain].de}` : `/${coop.slug[subdomain][lang]}`
                console.log("URL:", url)
                stateElement.textContent = gmLabel
                stateElement.setAttribute("href", url)

                const popoverContent = /*html*/`
                    <h2 class="title">${t.popover[coop.short].title}</h2>
                    <span class="text"><span>${t.popover[coop.short].desc}</span></span>
                    <div class="link-wrapper">
                        <a target="_parent" href="${url}" class="link">${t.to_cooperative}</a>
                    </div>
                `

                const marker = document.querySelector(`.map-marker[data-map-area="${gm}"]`)
                if (marker) {
                    marker.setAttribute("data-area-url", url)
                    let dataContent = marker.getAttribute("data-content")
                    if (dataContent) {
                        console.log(dataContent)
                        // dataContent = dataContent.replace(/href="([^&]*)"/, `href="${url}"`)
                        // marker.setAttribute("data-content", dataContent)
                        marker.setAttribute('data-content', popoverContent)
                    }
                }
                if (typeof $(marker).popover === "function") {
                    try {
                        $(marker).popover({ trigger: 'manual' })
                        $(marker).popover('show')
                    } catch (e) {
                        console.error("Error triggering map marker click:", e)
                    }
                }
            }
        })
}
