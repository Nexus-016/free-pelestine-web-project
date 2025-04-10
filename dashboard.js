// Remove the imports and use global Firebase
// const db = window.db from index.html initialization

// Initialize the map
async function initDashboard() {
    try {
        console.log('[Dashboard] Starting initialization...');
        
        if (!window.d3) {
            throw new Error('D3.js not loaded');
        }
        if (!window.topojson) {
            throw new Error('Topojson not loaded');
        }
        if (!window.db) {
            throw new Error('Firebase database not initialized');
        }

        // Load world map data
        console.log('[Dashboard] Fetching map data...');
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        if (!response.ok) {
            throw new Error(`Map data fetch failed: ${response.status}`);
        }
        const topology = await response.json();
        console.log('[Dashboard] Map data loaded');

        const countries = topojson.feature(topology, topology.objects.countries);
        const worldMap = document.getElementById('world-map');
        
        if (!worldMap) {
            throw new Error('World map container not found');
        }

        const width = Math.min(worldMap.clientWidth, 1000); // Limit max width
        const height = Math.min(width * 0.5, 500); // Maintain aspect ratio
        
        console.log('[Dashboard] Setting up SVG with dimensions:', { width, height });
        
        // Clear any existing SVG
        worldMap.innerHTML = '';
        
        const svg = d3.select('#world-map')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const projection = d3.geoNaturalEarth1()
            .fitSize([width, height], countries);

        const path = d3.geoPath().projection(projection);

        // Draw base map
        svg.selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'country')
            .attr('id', d => {
                console.log('Country data:', d);
                return `country-${d.id}`;
            });

        console.log('[Dashboard] Base map drawn');

        // Set up Firebase listeners
        console.log('[Dashboard] Setting up Firebase listeners...');
        
        window.db.ref('countries').on('value', snapshot => {
            console.log('[Dashboard] Countries update:', snapshot.val());
            const countries = snapshot.val() || {};
            updateMapColors(countries);
            updateTopCountries(countries);
        }, error => {
            console.error('[Dashboard] Firebase countries error:', error);
        });

        window.db.ref('totalSupports').on('value', snapshot => {
            console.log('[Dashboard] Total supports update:', snapshot.val());
            const total = snapshot.val() || 0;
            const counter = document.getElementById('total-counter');
            if (counter) {
                counter.textContent = total.toLocaleString();
            }
        }, error => {
            console.error('[Dashboard] Firebase total supports error:', error);
        });

        addMapInteractions();
        console.log('[Dashboard] Initialization complete');

    } catch (error) {
        console.error('[Dashboard] Initialization error:', error);
        // Show error to user
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML += `
                <div style="color: var(--palestine-red); padding: 1rem; text-align: center;">
                    Error loading dashboard. Please refresh the page.
                    <br>
                    Error details: ${error.message}
                </div>
            `;
        }
    }
}

function updateMapColors(countries) {
    try {
        if (!countries || typeof countries !== 'object') {
            throw new Error('Invalid countries data');
        }

        // Reset all countries first
        document.querySelectorAll('.country').forEach(el => {
            el.style.fill = '#2D2D2D';
            el.classList.remove('country-glow-low', 'country-glow-medium', 'country-glow-high');
        });

        // Update countries with support
        Object.entries(countries).forEach(([code, data]) => {
            const element = document.querySelector(`#country-${code}`);
            if (element) {
                const count = data.count || 0;
                
                // Add glow based on absolute count values
                if (count >= 20) {
                    element.classList.add('country-glow-high');
                } else if (count >= 10) {
                    element.classList.add('country-glow-medium');
                } else if (count >= 1) {
                    element.classList.add('country-glow-low');
                }

                // Add tooltip
                element.setAttribute('title', `${data.name}: ${count} supporters`);
                
                // Add click handler to show info
                element.onclick = () => {
                    alert(`${data.name}\nSupport Count: ${count}`);
                };
            }
        });
    } catch (error) {
        console.error('[Dashboard] Map update error:', error);
    }
}

function addMapInteractions() {
    document.querySelectorAll('.country').forEach(country => {
        country.addEventListener('mouseover', function() {
            this.style.opacity = '0.8';
            if (this.classList.contains('country-glow-high')) {
                this.style.filter = 'drop-shadow(0 0 25px rgba(228, 49, 43, 1))';
            }
        });

        country.addEventListener('mouseout', function() {
            this.style.opacity = '1';
            // Reset to original glow class
            if (this.classList.contains('country-glow-high')) {
                this.style.filter = '';
            }
        });
    });
}

function updateTopCountries(countries) {
    try {
        const sortedCountries = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);

        const list = document.getElementById('top-countries');
        list.innerHTML = sortedCountries
            .map(([_, data]) => `<li>${data.name}: ${data.count.toLocaleString()} supports</li>`)
            .join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

// Initialize dashboard when document is ready
document.addEventListener('DOMContentLoaded', initDashboard);
