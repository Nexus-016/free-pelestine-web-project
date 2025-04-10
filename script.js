import { database } from "./firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { countries, populateCountries } from "./country.js";

document.addEventListener("DOMContentLoaded", () => {
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
    let supporterData = {}; // Global variable to store supporter data

    // Toggle navigation menu visibility on mobile
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    // Close the menu when a link is clicked
    navMenu.addEventListener("click", (event) => {
        if (event.target.classList.contains("nav-link")) {
            navMenu.classList.remove("active");
        }
    });

    // Debounce function to optimize search input
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
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
        let totalSupporters = 0;

        // Ensure supporterData contains only numeric values
        Object.values(supporterData).forEach((count) => {
            if (typeof count === "number") {
                totalSupporters += count;
            } else {
                console.warn("Invalid data detected in supporterData:", count);
            }
        });

        supportCount.textContent = `${totalSupporters} people have supported so far.`;
    }

    // Check if the user has already voted
    function checkVotingStatus() {
        const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
        if (hasVoted) {
            disableVotingUI();
        }
    }

    // Disable voting UI after the user has voted
    function disableVotingUI() {
        supportButton.disabled = true;
        supportButton.textContent = "You have already voted";
        thankYouMessage.classList.remove("hidden");
        disableSupportSideRadios();
    }

    // Disable all support side radio buttons
    function disableSupportSideRadios() {
        supportSideRadios.forEach((radio) => {
            radio.disabled = true;
        });
    }

    // Enable the button only if "Palestine" is selected and the user hasn't voted
    supportSideRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
            if (radio.value === "Palestine" && radio.checked && !hasVoted) {
                supportButton.disabled = false;
            } else {
                supportButton.disabled = true;
            }
        });
    });

    // Submit support for a country
    supportButton.addEventListener("click", async () => {
        const selectedCountry = countrySelect.value;
        const currentCount = supporterData[selectedCountry] || 0;
        try {
            await update(ref(database, `supporters/${selectedCountry}`), { count: currentCount + 1 });
            supporterData[selectedCountry] = currentCount + 1;
            updateSupportCount();
            // Mark the user as having voted
            localStorage.setItem(HAS_VOTED_KEY, "true");
            disableVotingUI();
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
            populateCountries(filteredCountries, countrySelect);
        }, 300)
    );

    // Populate the dropdown with all countries on page load
    populateCountries(Object.keys(countries), countrySelect);

    // Fetch supporter data on page load
    fetchSupporterData();

    // Check voting status on page load
    checkVotingStatus();
});