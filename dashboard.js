// Remove the imports and use global Firebase
// const db = window.db from index.html initialization

// Initialize the map
async function initDashboard() {
    try {
        console.log('Initializing dashboard...');
        // Load world map data
        const topology = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(response => response.json());

        const countries = topojson.feature(topology, topology.objects.countries);
        console.log('Map data loaded');

        // Set up D3 map
        const width = document.getElementById('world-map').clientWidth;
        const height = 500;
        
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

        console.log('Base map drawn');

        // Listen for support updates
        window.db.ref('countries').on('value', snapshot => {
            console.log('Countries update received:', snapshot.val());
            const countries = snapshot.val() || {};
            updateMapColors(countries);
            updateTopCountries(countries);
        });

        // Listen for total supports
        window.db.ref('totalSupports').on('value', snapshot => {
            console.log('Total supports update:', snapshot.val());
            const total = snapshot.val() || 0;
            document.getElementById('total-counter').textContent = total.toLocaleString();
        });

    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

function updateMapColors(countries) {
    try {
        const supportCounts = Object.values(countries).map(c => c.count || 0);
        const maxSupport = Math.max(...supportCounts, 1); // Ensure non-zero denominator
        
        Object.entries(countries).forEach(([code, data]) => {
            const intensity = (data.count || 0) / maxSupport;
            const element = document.querySelector(`#country-${code}`);
            if (element) {
                element.style.fill = `rgba(20, 153, 84, ${intensity})`;
                if (intensity > 0.3) {
                    element.classList.add('country-glow');
                }
            }
        });
    } catch (error) {
        console.error('Error updating map colors:', error);
    }
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
