function initDashboard() {
    // Initialize the map
    const map = L.map('world-map').setView([20, 0], 2);
    window.map = map; // Store map reference globally
    
    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load GeoJSON data
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
        .then(res => res.json())
        .then(world => {
            const geoJson = topojson.feature(world, world.objects.countries);
            window.mapData = geoJson;

            // Add GeoJSON layer with custom style
            L.geoJSON(geoJson, {
                style: function(feature) {
                    return {
                        fillColor: '#2D2D2D',
                        weight: 1,
                        opacity: 1,
                        color: '#121212',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Store layer reference by country code
                    feature.properties.layer = layer;
                    layer.bindTooltip(feature.properties.name);
                }
            }).addTo(map);

            // Set up Firebase listeners
            window.db.ref('countries').on('value', updateMapColors);
            window.db.ref('totalSupports').on('value', updateTotalCounter);
        });
}

function updateMapColors(snapshot) {
    try {
        const countries = snapshot.val() || {};
        const maxSupport = Math.max(...Object.values(countries).map(c => c.count || 0));

        // Update each country's style based on support
        Object.entries(countries).forEach(([code, data]) => {
            const count = data.count || 0;
            const feature = window.mapData.features.find(f => f.id === code);
            
            if (feature && feature.properties.layer) {
                const layer = feature.properties.layer;
                const intensity = Math.min(1, count / 20); // Normalize to max 1
                
                // Calculate support level
                let supportClass = '';
                if (count >= maxSupport * 0.7) supportClass = 'high-support';
                else if (count >= maxSupport * 0.3) supportClass = 'medium-support';
                else if (count > 0) supportClass = 'low-support';

                // Apply styles
                layer.setStyle({
                    fillColor: `rgba(228, 49, 43, ${intensity})`,
                    className: supportClass
                });

                // Update tooltip
                layer.bindTooltip(
                    `${data.name}: ${count.toLocaleString()} supporters`,
                    { className: supportClass + '-tooltip' }
                );
            }
        });

        // Update top countries list
        updateTopCountries(countries);

    } catch (error) {
        console.error('[Dashboard] Map update error:', error);
    }
}

function updateTotalCounter(snapshot) {
    try {
        document.getElementById('total-counter').textContent = 
            (snapshot.val() || 0).toLocaleString();
    } catch (error) {
        console.error('[Dashboard] Total counter update error:', error);
    }
}

function updateTopCountries(countries) {
    try {
        const list = document.getElementById('top-countries');
        const sorted = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);
        
        list.innerHTML = sorted.map(([code, data]) => {
            const supportClass = getSupportClass(data.count);
            return `
                <li class="${supportClass}">
                    ${data.name}: ${data.count.toLocaleString()} supporters
                </li>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

function getSupportClass(count) {
    // Helper function to determine support class
    if (count >= 20) return 'high-support';
    if (count >= 10) return 'medium-support';
    if (count >= 1) return 'low-support';
    return '';
}

function initializeRealtimeUpdates() {
    window.db.ref('countries').on('value', snapshot => {
        updateMapColors(snapshot);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initializeRealtimeUpdates();
});
