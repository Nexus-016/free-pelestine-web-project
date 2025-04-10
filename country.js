export let countries = {}; // Global variable to store country data

// Preload and cache country data
export async function preloadCountryData() {
    try {
        // Check if country data is already cached
        const cachedCountries = localStorage.getItem("countries");
        if (cachedCountries) {
            console.log("Using cached country data.");
            countries = JSON.parse(cachedCountries);
        } else {
            console.log("Fetching country data...");
            const response = await fetch("/country/countries.json"); // Ensure this path is correct
            if (response.ok) {
                countries = await response.json();
                console.log("Fetched country data:", countries);

                // Cache the country data in localStorage
                localStorage.setItem("countries", JSON.stringify(countries));
            } else {
                console.error("Failed to fetch country data:", response.status);
            }
        }
    } catch (error) {
        console.error("Error preloading country data:", error);
    }
}

// Populate country dropdown
export function populateCountries(filteredCountries = [], countrySelect) {
    console.log("Populating countries:", filteredCountries); // Debugging log
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
    console.log("Dropdown populated successfully.");
}
