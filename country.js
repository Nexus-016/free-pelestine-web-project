export let countries = {}; // Global variable to store country data

// Preload and cache country data
export async function preloadCountryData() {
    try {
        console.log("Fetching country data...");
        const response = await fetch("country/countries.json"); // Ensure this path is correct
        if (response.ok) {
            countries = await response.json();
            console.log("Fetched and cached country data:", countries);
        } else {
            console.error("Failed to fetch country data:", response.status);
        }
    } catch (error) {
        console.error("Error preloading country data:", error);
    }
}

// Populate country dropdown
export function populateCountries(filteredCountries = [], countrySelect) {
    countrySelect.innerHTML = ""; // Clear existing options
    if (filteredCountries.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No countries available";
        countrySelect.appendChild(option);
    } else {
        filteredCountries.forEach((country) => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }
    console.log("Populated countries:", filteredCountries);
}
