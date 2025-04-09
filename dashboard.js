document.addEventListener("DOMContentLoaded", async () => {
    const map = L.map('map').setView([20, 0], 2); // Initialize map with a global view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let countries = {};

    // Fetch country data from the new folder
    async function fetchCountryData() {
        try {
            const response = await fetch("country/countries.json");
            if (response.ok) {
                countries = await response.json();
                console.log("Fetched country data:", countries);
            } else {
                console.error("Failed to fetch country data:", response.status);
            }
        } catch (error) {
            console.error("Error fetching country data:", error);
        }
    }

    // Fetch supporter data from localStorage or use default data
    const supporterData = JSON.parse(localStorage.getItem("supporterData")) || {};

    // Function to calculate brightness based on support count
    function getBrightness(count) {
        return Math.min(1, count / 50); // Normalize brightness (max 1 for 50+ votes)
    }

    // Add countries to the map
    async function addCountriesToMap() {
        await fetchCountryData(); // Ensure country data is loaded

        Object.keys(supporterData).forEach(country => {
            const count = supporterData[country];
            const coordinates = countries[country];

            if (coordinates) {
                const brightness = getBrightness(count);
                const circle = L.circleMarker(coordinates, {
                    radius: 10,
                    fillColor: `rgba(255, 255, 0, ${brightness})`, // Brightness affects opacity
                    color: '#FFD700',
                    weight: 1,
                    fillOpacity: brightness
                }).addTo(map);

                circle.bindPopup(`<b>${country}</b><br>Supporters: ${count}`);
            } else {
                console.warn(`Coordinates not found for country: ${country}`);
            }
        });
    }

    // Populate supporter list
    const supporterList = document.getElementById("supporterList");
    supporterList.innerHTML = ""; // Clear existing list
    Object.entries(supporterData).forEach(([country, count]) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${country}: ${count} supporters`;
        supporterList.appendChild(listItem);
    });

    // Adjust map size dynamically
    window.addEventListener("resize", () => {
        map.invalidateSize();
    });

    // Add countries to the map
    addCountriesToMap();
});
