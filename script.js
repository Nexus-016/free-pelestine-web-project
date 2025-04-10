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
        console.log("Geolocation API is supported. Requesting location...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Detected location: Latitude ${latitude}, Longitude ${longitude}`);

                // Reverse geocode to find the country and region
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    if (response.ok) {
                        const data = await response.json();
                        const userCountry = data.address?.country;
                        userRegion = data.address?.state || data.address?.region || userCountry || "Unknown Region";

                        if (userCountry && countries[userCountry]) {
                            countrySelect.value = userCountry;
                            console.log(`Auto-selected country: ${userCountry}`);
                        } else {
                            console.warn("Could not detect country or country not in the list.");
                        }
                    } else {
                        console.error("Failed to fetch reverse geocoding data:", response.status);
                    }
                } catch (error) {
                    console.error("Error during reverse geocoding:", error);
                }
            },
            (error) => {
                console.error("Error detecting location:", error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location permission denied. Please allow location access.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    default:
                        alert("An unknown error occurred while fetching location.");
                        break;
                }
            },
            {
                enableHighAccuracy: true, // Use high accuracy for better results
                timeout: 10000, // Timeout after 10 seconds
                maximumAge: 0, // Do not use cached location
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
        alert("Geolocation is not supported by your browser.");
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

    // Enable the "Support Palestine" button if the user hasn't voted
    function enableSupportButton() {
        const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
        console.log("Checking voting status:", hasVoted); // Debugging log
        if (!hasVoted) {
            supportButton.disabled = false;
            console.log("Support button enabled for voting.");
        } else {
            disableVotingUI(supportButton, thankYouMessage, supportSideRadios);
            console.log("Support button disabled because the user has already voted.");
        }
    }

    // Fetch supporter data and update the count
    fetchSupporterData(SUPPORTERS_REF, countries, (data) => updateSupportCount(data, supportCount));

    // Setup voting functionality
    setupVoting(supportSideRadios, supportButton, HAS_VOTED_KEY);

    // Check if the user has already voted and enable/disable the button
    enableSupportButton();

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