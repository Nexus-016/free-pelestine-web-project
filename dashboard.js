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

        const width = worldMap.clientWidth;
        const height = width * 0.5;
        
        console.log('[Dashboard] Setting up SVG with dimensions:', { width, height });
        
        // Clear any existing SVG
        worldMap.innerHTML = '';
        
        const svg = d3.select('#world-map')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

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
            .attr('id', d => `country-${d.id}`);

        // Set up Firebase listeners
        window.db.ref('countries').on('value', snapshot => {
            const data = snapshot.val() || {};
            updateMapColors(data);
            updateTopCountries(data);
        });

        window.db.ref('totalSupports').on('value', snapshot => {
            const total = snapshot.val() || 0;
            document.getElementById('total-counter').textContent = total.toLocaleString();
        });

    } catch (error) {
        console.error('[Dashboard] Error:', error);
    }
}

function updateMapColors(countries) {
    try {
        // Reset all countries
        document.querySelectorAll('.country').forEach(el => {
            el.style.fill = '#2D2D2D';
            el.classList.remove('high-support', 'medium-support', 'low-support');
        });

        // Update countries with support
        Object.entries(countries).forEach(([code, data]) => {
            const count = data.count || 0;
            const element = document.querySelector(`#country-${code}`);
            
            if (element) {
                if (count >= 20) {
                    element.classList.add('high-support');
                } else if (count >= 10) {
                    element.classList.add('medium-support');
                } else if (count >= 1) {
                    element.classList.add('low-support');
                }
                element.setAttribute('title', `${data.name}: ${count} supporters`);
            }
        });
    } catch (error) {
        console.error('[Dashboard] Map update error:', error);
    }
}

function updateTopCountries(countries) {
    try {
        const list = document.getElementById('top-countries');
        const sorted = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);
        
        list.innerHTML = sorted
            .map(([_, data]) => `<li>${data.name}: ${data.count.toLocaleString()} supporters</li>`)
            .join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
