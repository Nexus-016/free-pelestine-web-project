document.addEventListener("DOMContentLoaded", () => {
    const supportButton = document.getElementById("supportButton");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const supportCount = document.getElementById("supportCount");
    const countrySelect = document.getElementById("countrySelect");
    const countrySearch = document.getElementById("countrySearch");
    const questionContainers = document.querySelectorAll(".question-container");

    // List of all countries
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
        "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
        "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
        "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
        "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
        "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
        "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
        "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
        "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
        "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
        "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
        "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan",
        "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
        "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
        "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
        "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
        "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
        "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
        "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    // Check if the user has already voted
    function checkIfVoted() {
        const hasVoted = localStorage.getItem("hasVoted");
        if (hasVoted) {
            supportButton.disabled = true;
            supportButton.textContent = "You have already voted";
        }
    }

    checkIfVoted(); // Check on page load

    // Populate country dropdown
    function populateCountries(filteredCountries = countries) {
        countrySelect.innerHTML = ""; // Clear existing options
        filteredCountries.forEach((country) => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    populateCountries(); // Populate dropdown with all countries initially

    // Search functionality for countries
    countrySearch.addEventListener("input", () => {
        const searchTerm = countrySearch.value.toLowerCase();
        const filteredCountries = countries.filter((country) =>
            country.toLowerCase().includes(searchTerm)
        );
        populateCountries(filteredCountries);
    });

    // Local storage for supporter count
    function updateSupportCount() {
        const count = parseInt(localStorage.getItem("supportCount")) || 0;
        supportCount.textContent = `${count} people have supported so far.`;
    }

    updateSupportCount();

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

    supportButton.addEventListener("click", () => {
        const selectedCountry = countrySelect.value;

        // Fetch existing supporter data from localStorage
        const supporterData = JSON.parse(localStorage.getItem("supporterData")) || {};

        // Increment the support count for the selected country
        supporterData[selectedCountry] = (supporterData[selectedCountry] || 0) + 1;

        // Save updated data back to localStorage
        localStorage.setItem("supporterData", JSON.stringify(supporterData));

        console.log(`Support recorded for: ${selectedCountry}`);
        console.log("Updated supporter data:", supporterData);

        // Increment total supporter count in localStorage
        const currentCount = parseInt(localStorage.getItem("supportCount")) || 0;
        localStorage.setItem("supportCount", currentCount + 1);

        // Mark the user as having voted
        localStorage.setItem("hasVoted", "true");

        supportButton.disabled = true;
        supportButton.textContent = "You have already voted";
        thankYouMessage.classList.remove("hidden");
        updateSupportCount();
    });
});
