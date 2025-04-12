function initDashboard() {
    // Initialize the dashboard
    updateTotalCounter();
    updateTopCountries();
    
    // Initialize Palestine map with local data
    initPalestineMap();
}

function initPalestineMap() {
    try {
        const mapElement = document.getElementById('palestine-map');
        if (!mapElement) return;
        
        // Clear any loading message
        mapElement.innerHTML = '';
        
        // Initialize map focused on Palestine
        const map = L.map('palestine-map', {
            minZoom: 7,
            maxZoom: 10,
            zoomControl: true,
            attributionControl: false
        }).setView([31.9, 35.0], 8); // Center between Gaza and West Bank
        
        window.map = map;
        
        // Add dark theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '',
            opacity: 0.8
        }).addTo(map);
        
        // Use local Palestine GeoJSON data
        if (window.palestineGeoJSON) {
            // Add Palestine with highlighted style
            L.geoJSON(window.palestineGeoJSON, {
                style: {
                    fillColor: '#E4312b',
                    weight: 2,
                    opacity: 1,
                    color: '#FFFFFF',
                    fillOpacity: 0.7
                }
            }).addTo(map);
            
            // Add Palestine labels
            addPalestineLabels(map);
        } else {
            // Fallback if GeoJSON is not available
            fallbackToPalestineBoundary(map);
        }
    } catch (error) {
        console.error("Map initialization error:", error);
        showMapError();
    }
}

// Add Palestine labels to map
function addPalestineLabels(map) {
    // Add West Bank label
    const westBankLabel = L.divIcon({
        className: 'country-label region-label',
        html: `<span>West Bank</span>`,
        iconSize: [100, 40],
        iconAnchor: [50, 20]
    });

    L.marker([32.0, 35.3], {
        icon: westBankLabel,
        interactive: false
    }).addTo(map);
    
    // Add Gaza label
    const gazaLabel = L.divIcon({
        className: 'country-label region-label',
        html: `<span>Gaza</span>`,
        iconSize: [80, 40],
        iconAnchor: [40, 20]
    });

    L.marker([31.45, 34.40], {
        icon: gazaLabel,
        interactive: false
    }).addTo(map);
    
    // Add Palestine main label - now without a box background
    const palestineLabel = L.divIcon({
        className: 'country-label-main',
        html: `<div class="palestine-label">Palestine</div>`,
        iconSize: [120, 50],
        iconAnchor: [60, 25]
    });

    L.marker([31.7, 34.9], {
        icon: palestineLabel,
        interactive: false
    }).addTo(map);
}

// Fallback to a simple polygon representation
function fallbackToPalestineBoundary(map) {
    console.log("Using fallback Palestine boundary");
    
    // Gaza Strip
    const gazaCoords = [
        [31.22, 34.22], // Southwest
        [31.22, 34.58], // Southeast
        [31.70, 34.58], // Northeast
        [31.70, 34.22]  // Northwest
    ];
    
    // West Bank
    const westBankCoords = [
        [31.30, 35.00], // Southwest
        [31.30, 35.60], // Southeast
        [32.55, 35.60], // Northeast
        [32.55, 35.00]  // Northwest
    ];
    
    // Create polygons
    L.polygon(gazaCoords, {
        fillColor: '#E4312b',
        weight: 2,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.7
    }).addTo(map);
    
    L.polygon(westBankCoords, {
        fillColor: '#E4312b',
        weight: 2,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.7
    }).addTo(map);
    
    // Add labels
    addPalestineLabels(map);
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
                const countryName = data.name || 'Unknown';
                // Limit country name length for mobile
                const displayName = countryName.length > 15 
                    ? countryName.substring(0, 13) + '...' 
                    : countryName;
                
                return `
                    <li title="${countryName}">
                        <span class="country-name">${displayName}</span>
                        <span class="supporter-count">${count.toLocaleString()}</span>
                    </li>
                `;
            }).join('');
            
            // Add event listener for overflow handling
            if (window.innerWidth <= 768) {
                document.querySelectorAll('.country-name').forEach(el => {
                    el.addEventListener('click', function() {
                        if (this.parentElement.title) {
                            alert(this.parentElement.title);
                        }
                    });
                });
            }
            
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
