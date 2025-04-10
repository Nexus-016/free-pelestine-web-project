import { database } from "./firebase-config.js";
import { preloadCountryData, populateCountries, countries } from "./country.js";
import { setupMenuToggle } from "./menu.js";
import { fetchSupporterData, updateSupportCount } from "./supporter.js";
import { setupVoting, disableVotingUI } from "./voting.js";
import { setupSearch } from "./search.js";

document.addEventListener("DOMContentLoaded", async () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const countrySearch = document.getElementById("countrySearch");
    const supportSideRadios = document.querySelectorAll("input[name='supportSide']");
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    const SUPPORTERS_REF = ref(database, "supporters");
    const HAS_VOTED_KEY = "hasVoted"; // LocalStorage key to track voting status

    // Fallback: Hardcoded list of countries
    const fallbackCountries = ["Bangladesh", "Palestine", "United States", "India"];

    // Setup menu toggle
    setupMenuToggle(menuToggle, navMenu);

    // Preload country data and populate the dropdown
    await preloadCountryData();
    if (Object.keys(countries).length > 0) {
        console.log("Populating dropdown with countries:", Object.keys(countries));
        populateCountries(Object.keys(countries), countrySelect);
    } else {
        console.warn("No country data available.");
        populateCountries(fallbackCountries, countrySelect);
    }

    // Detect user location and auto-select their country
    let userRegion = "Unknown Region";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Detected location: ${latitude}, ${longitude}`);

                // Reverse geocode to find the country and region
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await response.json();
                const userCountry = data.address?.country;
                userRegion = data.address?.state || data.address?.region || userCountry || "Unknown Region";

                if (userCountry && countries[userCountry]) {
                    countrySelect.value = userCountry;
                    console.log(`Auto-selected country: ${userCountry}`);
                } else {
                    console.warn("Could not detect country or country not in the list.");
                }
            },
            (error) => {
                console.error("Error detecting location:", error);
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }

    // Optimize search input with debounce
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // Filter countries based on search input
    countrySearch.addEventListener(
        "input",
        debounce(() => {
            const searchTerm = countrySearch.value.toLowerCase();
            const filteredCountries = Object.keys(countries).filter((country) =>
                country.toLowerCase().includes(searchTerm)
            );
            populateCountries(filteredCountries, countrySelect);
        }, 300)
    );

    // Fetch supporter data and update the count
    fetchSupporterData(SUPPORTERS_REF, countries, (data) => updateSupportCount(data, supportCount));

    // Setup voting functionality
    setupVoting(supportSideRadios, supportButton, HAS_VOTED_KEY);

    // Check if the user has already voted
    const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
    if (hasVoted) {
        disableVotingUI(supportButton, thankYouMessage, supportSideRadios);
    }

    // Submit support for a country
    supportButton.addEventListener("click", async () => {
        const selectedCountry = countrySelect.value;
        const currentCount = countries[selectedCountry] || 0;

        try {
            // Update the supporter count in the database
            await update(ref(database, `supporters/${selectedCountry}`), { count: currentCount + 1 });

            // Mark the user as having voted
            localStorage.setItem(HAS_VOTED_KEY, "true");

            // Disable voting UI
            disableVotingUI(supportButton, thankYouMessage, supportSideRadios);

            // Show a popup with the confirmation message and region
            alert(`Thank you for supporting Palestine! Your region: ${userRegion}`);
        } catch (error) {
            console.error("Error updating supporter data:", error);
        }
    });
});