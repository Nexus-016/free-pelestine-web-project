// Fetch TopoJSON world map data and initialize
fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
    .then(res => res.json())
    .then(world => {
        // Convert TopoJSON to GeoJSON
        const geoData = topojson.feature(world, world.objects.countries);
        
        // Store data globally
        window.mapData = geoData;

        // Important countries mapping
        window.CountryData = {
            // Middle East
            "PSE": { name: "Palestine", iso2: "PS", region: "Middle East" },
            "ISR": { name: "Israel", iso2: "IL", region: "Middle East" },
            
            // South Asia
            "BGD": { name: "Bangladesh", iso2: "BD", region: "South Asia" },
            "PAK": { name: "Pakistan", iso2: "PK", region: "South Asia" },
            "IND": { name: "India", iso2: "IN", region: "South Asia" },
            
            // Major Powers
            "USA": { name: "United States", iso2: "US", region: "North America" },
            "CHN": { name: "China", iso2: "CN", region: "East Asia" },
            "RUS": { name: "Russia", iso2: "RU", region: "Eurasia" },
            
            // Europe
            "GBR": { name: "United Kingdom", iso2: "GB", region: "Europe" },
            "FRA": { name: "France", iso2: "FR", region: "Europe" },
            "DEU": { name: "Germany", iso2: "DE", region: "Europe" }
        };

        // Add country data to features
        geoData.features.forEach(f => {
            const countryInfo = window.CountryData[f.id] || {
                name: f.properties?.name || "Unknown",
                iso2: "XX",
                region: "Other"
            };
            f.properties = {
                ...f.properties,
                ...countryInfo,
                iso3: f.id
            };
        });

        // Signal that map data is ready
        window.dispatchEvent(new Event('mapDataReady'));
    })
    .catch(err => {
        console.error("Error loading map data:", err);
        document.getElementById('world-map').innerHTML = 
            '<div class="error">Error loading map data. Please refresh.</div>';
    });

// Helper functions
window.getCountryById = (id) => {
    return window.mapData?.features.find(f => 
        f.id === id || f.properties.iso2 === id
    );
};

window.getCountryName = (id) => {
    const country = window.getCountryById(id);
    return country?.properties.name || "Unknown";
};
