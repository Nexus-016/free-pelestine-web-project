function initDashboard() {
    // Initialize map with optimized settings
    const map = L.map('world-map', {
        minZoom: 2,
        maxZoom: 5,
        maxBounds: [[-60, -170], [85, 170]],
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelDebounceTime: 150,
        attributionControl: false // We'll add custom attribution
    }).setView([30, 0], 2);
    
    window.map = map;

    // Add dark theme tile layer with custom attribution
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '',
        noWrap: true,
        bounds: [[-60, -170], [85, 170]]
    }).addTo(map);

    // Add custom attribution
    const attribution = L.control.attribution({
        prefix: false,
        position: 'bottomright'
    }).addTo(map);
    attribution.addAttribution('<small>© OpenStreetMap</small>');

    // Load and add GeoJSON with optimized settings
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
        .then(res => res.json())
        .then(world => {
            const geoJson = topojson.feature(world, world.objects.countries);
            window.mapData = geoJson;

            // Add optimized GeoJSON layer
            L.geoJSON(geoJson, {
                interactive: true,
                style: function(feature) {
                    return {
                        fillColor: '#2D2D2D',
                        weight: 0.5,
                        opacity: 0.8,
                        color: '#121212',
                        fillOpacity: 0.7,
                        smoothFactor: 2
                    };
                },
                onEachFeature: function(feature, layer) {
                    feature.properties.layer = layer;
                    
                    // Optimize tooltips
                    layer.bindTooltip(feature.properties.name, {
                        direction: 'top',
                        sticky: true,
                        offset: [0, -5],
                        opacity: 0.9
                    });
                }
            }).addTo(map);

            // Set up Firebase listeners with throttling
            const throttledUpdate = throttle(updateMapColors, 500);
            window.db.ref('countries').on('value', throttledUpdate);
            window.db.ref('totalSupports').on('value', updateTotalCounter);
        });
}

// Add throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Update map colors with optimized performance
function updateMapColors(snapshot) {
    try {
        const countries = snapshot.val() || {};
        const maxSupport = Math.max(...Object.values(countries).map(c => c.count || 0));

        // Batch updates for better performance
        requestAnimationFrame(() => {
            Object.entries(countries).forEach(([code, data]) => {
                const count = data.count || 0;
                const feature = window.mapData.features.find(f => f.id === code);
                
                if (feature?.properties?.layer) {
                    const layer = feature.properties.layer;
                    const intensity = Math.min(1, count / maxSupport);
                    const supportClass = getSupportClass(count);
                    
                    // Apply styles and glow effect
                    const path = layer.getElement();
                    if (path) {
                        // Remove old classes
                        path.classList.remove('high-support', 'medium-support', 'low-support');
                        // Add new class for glow effect
                        if (supportClass) {
                            path.classList.add(supportClass);
                        }
                    }

                    // Update fill color
                    layer.setStyle({
                        fillColor: `rgba(228, 49, 43, ${intensity})`,
                        fillOpacity: 0.7 + (intensity * 0.3),
                        className: supportClass
                    });

                    // Update tooltip
                    layer.bindTooltip(
                        `${data.name}: ${count.toLocaleString()}`,
                        { className: 'map-tooltip' }
                    );
                }
            });
        });

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
