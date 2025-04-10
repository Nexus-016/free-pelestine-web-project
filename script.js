import { database } from "./firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const countrySearch = document.getElementById("countrySearch");
    const supportSideRadios = document.querySelectorAll("input[name='supportSide']");

    const SUPPORTERS_REF = ref(database, "supporters");
    let countries = {}; // Global variable to store country data
    let supporterData = {}; // Global variable to store supporter data

    // Debounce function to optimize search input
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // Preload and cache country data
    async function preloadCountryData() {
        try {
            const response = await fetch("/country/countries.json");
            if (response.ok) {
                countries = await response.json();
                populateCountries(Object.keys(countries));
            } else {
                console.error("Failed to fetch country data:", response.status);
            }
        } catch (error) {
            console.error("Error preloading country data:", error);
        }
    }

    // Populate country dropdown
    function populateCountries(filteredCountries = []) {
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
    }

    // Fetch supporter data from Firebase
    async function fetchSupporterData() {
        try {
            console.log("Fetching supporter data...");
            const snapshot = await get(SUPPORTERS_REF);
            if (snapshot.exists()) {
                supporterData = snapshot.val();
                console.log("Fetched supporter data:", supporterData);
                updateSupportCount();
            } else {
                console.warn("No supporter data found.");
                supportCount.textContent = "No data available.";
            }
        } catch (error) {
            console.error("Error fetching supporter data:", error);
            supportCount.textContent = "Failed to load data.";
        }
    }

    // Update the supporter count display
    function updateSupportCount() {
        const totalSupporters = Object.values(supporterData).reduce((sum, count) => sum + count, 0);
        supportCount.textContent = `${totalSupporters} people have supported so far.`;
    }

    // Enable the button only if "Palestine" is selected
    supportSideRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.value === "Palestine" && radio.checked) {
                supportButton.disabled = false;
            } else {
                supportButton.disabled = true;
            }
        });
    });

    // Submit support for a country
    supportButton.addEventListener("click", async () => {
        const selectedCountry = countrySelect.value;

        try {
            const currentCount = supporterData[selectedCountry] || 0;
            await update(ref(database, `supporters/${selectedCountry}`), { count: currentCount + 1 });
            supporterData[selectedCountry] = currentCount + 1;
            updateSupportCount();
            thankYouMessage.classList.remove("hidden");
            supportButton.disabled = true;
            supportButton.textContent = "You have already voted";
        } catch (error) {
            console.error("Error updating supporter data:", error);
        }
    });

    // Optimize search input with debounce
    countrySearch.addEventListener(
        "input",
        debounce(() => {
            const searchTerm = countrySearch.value.toLowerCase();
            const filteredCountries = Object.keys(countries).filter((country) =>
                country.toLowerCase().includes(searchTerm)
            );
            populateCountries(filteredCountries);
        }, 300)
    );

    // Fetch and cache country data, then populate the dropdown
    preloadCountryData();

    // Fetch supporter data on page load
    fetchSupporterData();
});
