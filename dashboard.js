function initDashboard() {
    // Initialize map with optimized settings
    const map = L.map('world-map', {
        minZoom: 2,
        maxZoom: 4,
        maxBounds: [[-60, -170], [85, 170]],
        zoomSnap: 0.5,
        attributionControl: false
    }).setView([30, 0], 2);
    
    window.map = map;

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '',
        noWrap: true,
        bounds: [[-60, -170], [85, 170]]
    }).addTo(map);

    // Load GeoJSON data
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
        .then(res => res.json())
        .then(world => {
            const geoJson = topojson.feature(world, world.objects.countries);
            window.mapData = geoJson;

            // Add GeoJSON layer
            window.mapLayer = L.geoJSON(geoJson, {
                style: {
                    fillColor: '#2D2D2D',
                    weight: 1,
                    opacity: 0.8,
                    color: '#121212',
                    fillOpacity: 0.7
                },
                onEachFeature: (feature, layer) => {
                    feature.properties.layer = layer;
                }
            }).addTo(map);

            // Set up Firebase listener
            window.db.ref('countries').on('value', updateMapColors);
            window.db.ref('totalSupports').on('value', updateTotalCounter);
        });
}

function updateMapColors(snapshot) {
    const countries = snapshot.val() || {};
    const labels = [];

    Object.entries(countries).forEach(([code, data]) => {
        const count = data.count || 0;
        const feature = window.mapData.features.find(f => f.id === code);
        
        if (feature?.properties?.layer) {
            const layer = feature.properties.layer;
            
            // Update country color based on support count
            layer.setStyle({
                fillColor: count > 0 ? '#E4312b' : '#2D2D2D',
                fillOpacity: count > 0 ? 0.7 : 0.5
            });

            // Create label for supporter count
            if (count > 0) {
                const center = layer.getBounds().getCenter();
                const label = L.divIcon({
                    className: 'supporter-label',
                    html: `<span>${count}</span>`,
                    iconSize: [40, 20],
                    iconAnchor: [20, 10]
                });

                const marker = L.marker(center, {
                    icon: label,
                    zIndexOffset: 1000
                });
                
                labels.push(marker);
            }
        }
    });

    // Remove old labels and add new ones
    if (window.labelGroup) {
        window.labelGroup.clearLayers();
    }
    window.labelGroup = L.layerGroup(labels).addTo(map);
}

function updateTotalCounter(snapshot) {
    const total = snapshot.val() || 0;
    document.getElementById('total-counter').textContent = total.toLocaleString();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
