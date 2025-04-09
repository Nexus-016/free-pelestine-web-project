document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([20, 0], 2); // Initialize map with a global view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Example supporter data (replace with actual data from localStorage or GitHub)
    const supporterData = JSON.parse(localStorage.getItem("supporterData")) || {
        "United States": 50,
        "United Kingdom": 30,
        "Palestine": 100,
        "India": 20,
        "Canada": 10
    };

    // Function to calculate brightness based on support count
    function getBrightness(count) {
        return Math.min(1, count / 100); // Normalize brightness (max 1)
    }

    // Add countries to the map
    Object.keys(supporterData).forEach(country => {
        const brightness = getBrightness(supporterData[country]);
        const circle = L.circleMarker(getCountryCoordinates(country), {
            radius: 10,
            fillColor: `rgba(255, 255, 0, ${brightness})`, // Brightness affects opacity
            color: '#FFD700',
            weight: 1,
            fillOpacity: brightness
        }).addTo(map);

        circle.bindPopup(`<b>${country}</b><br>Supporters: ${supporterData[country]}`);
    });

    // Populate supporter list
    const supporterList = document.getElementById("supporterList");
    supporterList.innerHTML = ""; // Clear existing list
    Object.entries(supporterData).forEach(([country, count]) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${country}: ${count} supporters`;
        supporterList.appendChild(listItem);
    });

    // Function to get coordinates for a country (replace with a proper geocoding API if needed)
    function getCountryCoordinates(country) {
        const coordinates = {
            "United States": [37.0902, -95.7129],
            "United Kingdom": [55.3781, -3.4360],
            "Palestine": [31.9522, 35.2332],
            "India": [20.5937, 78.9629],
            "Canada": [56.1304, -106.3468]
        };
        return coordinates[country] || [0, 0]; // Default to [0, 0] if country not found
    }

    // Adjust map size dynamically
    window.addEventListener("resize", () => {
        map.invalidateSize();
    });
});
