function initDashboard() {
    // Initialize Palestine map
    const map = L.map('palestine-map', {
        minZoom: 7,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: false
    }).setView([31.5, 34.8], 8);
    
    window.map = map;
    adjustMapForMobile(); // Call after map initialization

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '',
        opacity: 0.8
    }).addTo(map);

    // Add Palestine border
    fetch("https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries/PSE.geojson")
        .then(res => res.json())
        .then(data => {
            // Add Palestine with highlighted style
            L.geoJSON(data, {
                style: {
                    fillColor: '#E4312b',
                    weight: 2,
                    opacity: 1,
                    color: '#FFFFFF',
                    fillOpacity: 0.7
                }
            }).addTo(map);

            // Add Palestine label
            const center = [31.5, 34.8];
            const label = L.divIcon({
                className: 'country-label',
                html: `<span>Palestine</span>`,
                iconSize: [100, 40],
                iconAnchor: [50, 20]
            });

            L.marker(center, {
                icon: label,
                interactive: false
            }).addTo(map);
            
            // Set up Firebase listeners
            window.db.ref('totalSupports').on('value', updateTotalCounter);
            window.db.ref('countries').on('value', updateTopCountries);
        })
        .catch(err => {
            console.error("Error loading Palestine data:", err);
            document.getElementById('palestine-map').innerHTML = 
                '<div class="error">Error loading map data. Please refresh.</div>';
        });
        
    // Set up live map fallback
    setupLiveMapFallback();
}

// Adjust map for mobile
function adjustMapForMobile() {
    const isMobile = window.innerWidth < 768;
    const map = window.map;
    
    if (map) {
        if (isMobile) {
            // Mobile settings
            map.setZoom(7.5);
            map.setMinZoom(6);
        } else {
            // Desktop settings
            map.setZoom(8);
            map.setMinZoom(7);
        }
    }
}

// Add resize event listener
window.addEventListener('resize', adjustMapForMobile);

// Handle potential issues with embedded live map
function setupLiveMapFallback() {
    const frame = document.getElementById('live-map-frame');
    if (!frame) return;
    
    frame.onerror = function() {
        handleLiveMapError();
    };
    
    // Add timeout in case the iframe doesn't load
    setTimeout(function() {
        if (frame.contentWindow.length === 0) {
            handleLiveMapError();
        }
    }, 10000);
    
    // Alternative live map sources if needed
    const alternativeSources = [
        "https://www.ochaopt.org/page/live-map",
        "https://liveuamap.com/en/2023/31-january-gaza-strip",
        "https://reliefweb.int/maps-infographics"
    ];
    
    window.tryAlternativeMap = function() {
        const currentIndex = alternativeSources.indexOf(frame.src);
        const nextIndex = (currentIndex + 1) % alternativeSources.length;
        frame.src = alternativeSources[nextIndex];
        document.querySelector('.update-source').textContent = 
            `Source: ${getSourceName(alternativeSources[nextIndex])}`;
    };
}

function getSourceName(url) {
    if (url.includes('ochaopt')) return 'UN OCHA';
    if (url.includes('liveuamap')) return 'LiveUAMap';
    if (url.includes('reliefweb')) return 'ReliefWeb';
    return 'External Source';
}

function handleLiveMapError() {
    const wrapper = document.querySelector('.updates-wrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = `
        <div class="map-error">
            <p>Unable to load live map updates.</p>
            <button onclick="window.tryAlternativeMap()">
                Try Alternative Source
            </button>
            <p>Or visit <a href="https://www.ochaopt.org/page/live-map" target="_blank">
                UN OCHA</a> directly for updates.</p>
        </div>
    `;
}

function updateTotalCounter(snapshot) {
    const total = snapshot.val() || 0;
    document.getElementById('total-counter').textContent = total.toLocaleString();
}

function updateTopCountries(snapshot) {
    try {
        const countries = snapshot.val() || {};
        const list = document.getElementById('top-countries');
        const sorted = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);
        
        list.innerHTML = sorted.map(([code, data]) => {
            const count = data.count || 0;
            return `
                <li>
                    <span class="country-name">${data.name}</span>
                    <span class="supporter-count">${count.toLocaleString()}</span>
                </li>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
