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
        populateCountries(Object.keys(countries), countrySelect);
    } else {
        console.warn("Using fallback country data.");
        populateCountries(fallbackCountries, countrySelect);
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
});