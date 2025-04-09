document.addEventListener("DOMContentLoaded", () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const countrySearch = document.getElementById("countrySearch");
    const questionContainers = document.querySelectorAll(".question-container");

    // GitHub token and repository details
    const GITHUB_TOKEN = "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"; // Replace with your GitHub token
    const REPO = "Nexus-016/free-pelestine-web-project"; // Replace with your GitHub repo
    const FILE_PATH = "supporterData.json"; // File to update in the repo

    let supporterData = {}; // Global variable to store supporter data

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

    // Push supporter data to GitHub
    async function pushToGitHub() {
        // Fetch the latest data from GitHub to ensure no data is overwritten
        await fetchSupporterData();

        // Merge local data with fetched data
        const mergedData = { ...supporterData, ...JSON.parse(localStorage.getItem("supporterData") || "{}") };

        const content = JSON.stringify(mergedData, null, 2);
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
                supporterData = mergedData; // Update local data with merged data
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

    // Check if the user has already voted
    function checkIfVoted() {
        const hasVoted = localStorage.getItem("hasVoted");
        if (hasVoted) {
            supportButton.disabled = true;
            supportButton.textContent = "You have already voted";
        }
    }

    checkIfVoted(); // Check on page load

    // Temporary function to reset voting status for testing
    function resetVotingStatus() {
        localStorage.removeItem("hasVoted");
        console.log("Voting status has been reset. You can now vote again.");
    }

    // Call this function in the browser console to reset voting status
    window.resetVotingStatus = resetVotingStatus;

    // Populate country dropdown
    function populateCountries(filteredCountries = Object.keys(supporterData)) {
        countrySelect.innerHTML = ""; // Clear existing options
        filteredCountries.forEach((country) => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    // Update the supporter count display
    function updateSupportCount() {
        const totalSupporters = Object.values(supporterData).reduce((sum, count) => sum + count, 0);
        supportCount.textContent = `${totalSupporters} people have supported so far.`;
    }

    // Form validation logic
    function validateForm() {
        const allQuestionsCorrect = Array.from(questionContainers).every((container) => {
            const selectedOption = container.querySelector("input[type='radio']:checked");
            return selectedOption !== null; // Ensure an option is selected
        });

        // Enable or disable the support button based on the validation
        supportButton.disabled = !allQuestionsCorrect || localStorage.getItem("hasVoted");

        // Debugging: Log the validation status
        console.log("Validation status:", allQuestionsCorrect);
    }

    // Add event listeners for validation
    questionContainers.forEach((container) => {
        const radioButtons = container.querySelectorAll("input[type='radio']");
        radioButtons.forEach((radio) => {
            radio.addEventListener("change", validateForm); // Trigger validation on change
        });
    });

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

    // Fetch supporter data from GitHub on page load
    fetchSupporterData();

    // Push data to GitHub every 30 minutes
    setInterval(() => {
        pushToGitHub();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
});
