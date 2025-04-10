import { database } from "./firebase-config.js";
import { preloadCountryData, populateCountries, countries } from "./country.js";
import { setupMenuToggle } from "./menu.js";
import { fetchSupporterData, updateSupportCount } from "./supporter.js";
import { setupVoting, disableVotingUI } from "./voting.js";

document.addEventListener("DOMContentLoaded", async () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const supportSideRadios = document.querySelectorAll("input[name='supportSide']");
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const supportBtn = document.getElementById('supportBtn');
    const newUserContent = document.getElementById('newUserContent');

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
            alert(`Thank you for supporting Palestine!`);
        } catch (error) {
            console.error("Error updating supporter data:", error);
        }
    });

    // Check if user is new (hasn't clicked the button before)
    const hasSupported = localStorage.getItem('supportedPalestine');
    
    if (hasSupported === 'true') {
        // If returning user, already show the content
        newUserContent.classList.remove('hidden');
        supportBtn.textContent = 'Thank You for Supporting';
        supportBtn.disabled = true;
    }
    
    supportBtn.addEventListener('click', function() {
        // Unlock content for new users
        newUserContent.classList.remove('hidden');
        
        // Smooth scroll to the newly revealed content
        newUserContent.scrollIntoView({ behavior: 'smooth' });
        
        // Save that user has supported
        localStorage.setItem('supportedPalestine', 'true');
        
        // Update button
        supportBtn.textContent = 'Thank You for Supporting';
        supportBtn.disabled = true;
    });
});