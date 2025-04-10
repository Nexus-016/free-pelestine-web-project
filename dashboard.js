document.addEventListener("DOMContentLoaded", async () => {
    const map = L.map('map').setView([20, 0], 2); // Initialize map with a global view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let countries = {};
    let supporterData = {};

    const API_URL = "http://localhost:5000/api/supporters"; // Backend API URL

    // Fetch country data from the new folder
    async function fetchCountryData() {
        try {
            const response = await fetch("/country/countries.json"); // Ensure the path starts with "/"
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

    // Fetch supporter data from MongoDB
    async function fetchSupporterData() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                supporterData = data.reduce((acc, item) => {
                    acc[item.country] = item.count;
                    return acc;
                }, {});
                console.log("Fetched supporter data from MongoDB:", supporterData);
                updateDashboard();
            } else {
                console.error("Failed to fetch supporter data:", response.status);
            }
        } catch (error) {
            console.error("Error fetching supporter data:", error);
        }
    }

    // Function to calculate brightness based on support count
    function getBrightness(count) {
        return Math.min(1, count / 50); // Normalize brightness (max 1 for 50+ votes)
    }

    // Update the map with the latest data
    function updateMap() {
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer); // Remove existing markers
            }
        });

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

    // Update the supporter list with the latest data
    function updateSupporterList() {
        const supporterList = document.getElementById("supporterList");
        supporterList.innerHTML = ""; // Clear existing list
        Object.entries(supporterData).forEach(([country, count]) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${country}: ${count} supporters`;
            supporterList.appendChild(listItem);
        });
    }

    // Update the entire dashboard
    function updateDashboard() {
        updateMap();
        updateSupporterList();
    }

    // Fetch country data and initial supporter data
    await fetchCountryData();
    await fetchSupporterData();

    // Periodically fetch the latest supporter data and update the dashboard
    setInterval(() => {
        fetchSupporterData();
    }, 30 * 1000); // Fetch every 30 seconds
});
