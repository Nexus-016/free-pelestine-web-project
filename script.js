document.addEventListener("DOMContentLoaded", () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const countrySearch = document.getElementById("countrySearch");
    const supportSideRadios = document.querySelectorAll("input[name='supportSide']");
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    const COUNTRIES_CACHE_KEY = "countriesCache"; // Key for caching countries in localStorage
    let countries = {}; // Global variable to store country data
    let supporterData = {}; // Global variable to store supporter data

    // GitHub token and repository details
    const GITHUB_TOKEN = "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"; // Replace with your GitHub token
    const REPO = "Nexus-016/free-pelestine-web-project"; // Replace with your GitHub repo
    const FILE_PATH = "supporterData.json"; // File to update in the repo

    // Preload and cache country data
    async function preloadCountryData() {
        try {
            const cachedCountries = localStorage.getItem(COUNTRIES_CACHE_KEY);
            if (cachedCountries) {
                countries = JSON.parse(cachedCountries);
                console.log("Loaded countries from cache:", countries);
            } else {
                const response = await fetch("/country/countries.json");
                if (response.ok) {
                    countries = await response.json();
                    localStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify(countries)); // Cache the data
                    console.log("Fetched and cached country data:", countries);
                } else {
                    console.error("Failed to fetch country data:", response.status);
                }
            }
        } catch (error) {
            console.error("Error preloading country data:", error);
        }
    }

    // Fetch supporter data from GitHub
    async function fetchSupporterData() {
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                headers: { "Authorization": `token ${GITHUB_TOKEN}` }
            });

            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content); // Decode base64 content
                supporterData = JSON.parse(content);
                updateSupportCount();
                console.log("Fetched supporter data from GitHub:", supporterData);
            } else if (response.status === 404) {
                console.warn("Supporter data file not found on GitHub. Initializing empty data.");
                supporterData = {};
            } else {
                console.error("Failed to fetch supporter data from GitHub:", await response.json());
            }
        } catch (error) {
            console.error("Error fetching supporter data from GitHub:", error);
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

    // Fetch and cache country data, then populate the dropdown
    preloadCountryData().then(() => {
        populateCountries(Object.keys(countries));
    });

    // Fetch supporter data from GitHub on page load
    fetchSupporterData();

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

    supportButton.addEventListener("click", async () => {
        const selectedCountry = countrySelect.value;

        // Increment the support count for the selected country
        supporterData[selectedCountry] = (supporterData[selectedCountry] || 0) + 1;

        console.log(`Support recorded for: ${selectedCountry}`);
        console.log("Updated supporter data:", supporterData);

        // Mark the user as having voted
        localStorage.setItem("hasVoted", "true");

        supportButton.disabled = true;
        supportButton.textContent = "You have already voted";
        thankYouMessage.classList.remove("hidden");
        updateSupportCount();

        // Push updated data to GitHub
        await pushToGitHub();
    });

    // Push supporter data to GitHub
    async function pushToGitHub() {
        const content = JSON.stringify(supporterData, null, 2);
        const encodedContent = btoa(content);

        try {
            const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${GITHUB_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Update supporter data",
                    content: encodedContent,
                    sha: await getFileSHA()
                })
            });

            if (response.ok) {
                console.log("Supporter data pushed to GitHub.");
            } else {
                console.error("Failed to push to GitHub:", await response.json());
            }
        } catch (error) {
            console.error("Error pushing to GitHub:", error);
        }
    }

    // Get the SHA of the file in the GitHub repo
    async function getFileSHA() {
        try {
            const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                headers: { "Authorization": `token ${GITHUB_TOKEN}` }
            });

            if (response.ok) {
                const data = await response.json();
                return data.sha;
            }
        } catch (error) {
            console.warn("File SHA not found. Assuming new file.");
        }
        return null; // File does not exist
    }

    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });
});
