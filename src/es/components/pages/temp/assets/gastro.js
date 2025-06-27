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

// valid ZIP (max 4 digits) or location name (min 2 chars, not all digits)
const isValidQuery = (query) => {
    return (query.length > 3 && /^\d{1,4}$/.test(query) && query.length <= 4) || (query.length > 1 && /\D/.test(query))
}

const inputField = document.querySelector("#ref-address")
const errorMessage = document.createElement("div")
errorMessage.className = "input-error-message"
errorMessage.style.color = "red"
errorMessage.style.marginTop = "4px"
inputField.parentNode.insertBefore(errorMessage, inputField.nextSibling)

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

const resetButton = document.querySelector(".button-reset")
resetButton.addEventListener("click", function () {
    inputField.value = ""
    clearSuggestions()
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
                stateElement.textContent = gmLabel
                stateElement.setAttribute("href", `/de/genossenschaften/${coop.slag}.html`)
                const marker = document.querySelector(`.map-marker[data-map-area="${gm}"]`)
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
