function initDashboard() {
    // Initialize the dashboard
    updateTotalCounter();
    updateTopCountries();
    
    // Try to load Palestine map
    initPalestineMap();
}

function initPalestineMap() {
    try {
        const mapElement = document.getElementById('palestine-map');
        if (!mapElement) return;
        
        // Initialize map focused on Palestine
        const map = L.map('palestine-map', {
            minZoom: 7,
            maxZoom: 10,
            zoomControl: true,
            attributionControl: false
        }).setView([31.5, 34.8], 8);
        
        window.map = map;
        
        // Add dark theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '',
            opacity: 0.8
        }).addTo(map);
        
        // Try multiple sources for Palestine GeoJSON
        loadPalestineGeoJSON(map)
            .catch(error => {
                console.error("GeoJSON loading failed:", error);
                fallbackToPalestineBoundary(map);
            });
    } catch (error) {
        console.error("Map initialization error:", error);
        showMapError();
    }
}

// Try multiple sources for Palestine GeoJSON
async function loadPalestineGeoJSON(map) {
    const sources = [
        "https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries/PSE.geojson",
        "https://raw.githubusercontent.com/KoGor/Maps.GeoInfo/master/GeoJSON/palestine.json",
        "https://gist.githubusercontent.com/christopherthompson81/7c7ddd391c67c3114da215cea08f13e3/raw/84a3b5fa9c5699e9776bf40944a3b5abba2af2cd/palestine.geojson"
    ];
    
    let error = null;
    for (const source of sources) {
        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error(`Failed to load from ${source}`);
            
            const data = await response.json();
            
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
            addPalestineLabel(map);
            
            console.log("Loaded Palestine GeoJSON successfully");
            return true;
        } catch (e) {
            console.warn(`Error loading from ${source}:`, e);
            error = e;
        }
    }
    
    throw error || new Error("All GeoJSON sources failed");
}

// Fallback to a simple polygon if GeoJSON fails
function fallbackToPalestineBoundary(map) {
    console.log("Using fallback Palestine boundary");
    
    // Simple approximation of Palestine boundary
    const palestineCoords = [
        [31.22, 34.22], // Southwest
        [31.22, 35.57], // Southeast
        [32.55, 35.57], // Northeast
        [32.55, 34.22]  // Northwest
    ];
    
    // Create a simple polygon
    L.polygon(palestineCoords, {
        fillColor: '#E4312b',
        weight: 2,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.7
    }).addTo(map);
    
    // Add Palestine label
    addPalestineLabel(map);
}

// Add Palestine label to map
function addPalestineLabel(map) {
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
}

// Show error message when map fails completely
function showMapError() {
    const mapElement = document.getElementById('palestine-map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="map-error">
                <h3>Map Unavailable</h3>
                <p>Sorry, we're unable to display the Palestine map at this time.</p>
                <p>But you can still see the support statistics below.</p>
            </div>
        `;
    }
}

// Update total counter display
function updateTotalCounter() {
    window.db.ref('totalSupports').on('value', snapshot => {
        try {
            const total = snapshot.val() || 0;
            const element = document.getElementById('total-counter');
            if (element) {
                element.textContent = total.toLocaleString();
            }
        } catch (error) {
            console.error('[Dashboard] Total counter update error:', error);
        }
    });
}

// Update top countries list
function updateTopCountries() {
    window.db.ref('countries').on('value', snapshot => {
        try {
            const countries = snapshot.val() || {};
            const list = document.getElementById('top-countries');
            if (!list) return;
            
            const sorted = Object.entries(countries)
                .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
                .slice(0, 10);
            
            if (sorted.length === 0) {
                list.innerHTML = '<li class="no-data">No supporter data available yet</li>';
                return;
            }
            
            list.innerHTML = sorted.map(([code, data]) => {
                const count = data.count || 0;
                return `
                    <li>
                        <span class="country-name">${data.name || 'Unknown'}</span>
                        <span class="supporter-count">${count.toLocaleString()}</span>
                    </li>
                `;
            }).join('');
        } catch (error) {
            console.error('Error updating top countries:', error);
            const list = document.getElementById('top-countries');
            if (list) {
                list.innerHTML = '<li class="error">Error loading country data</li>';
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
