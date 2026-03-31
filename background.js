// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "searchOFF") {
        // Use the live Canadian database
        const apiUrl = `https://ca.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(request.query)}&search_simple=1&action=process&json=1`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; 
    }
});