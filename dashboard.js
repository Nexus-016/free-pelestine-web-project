import { db } from './firebase-config.js';
import { ref, onValue } from 'firebase/database';

let worldMap;

// Initialize the map
async function initDashboard() {
    // Load world map data
    const topology = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(response => response.json());

    const countries = topojson.feature(topology, topology.objects.countries);

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

    // Listen for support updates
    window.db.ref('supports').on('value', snapshot => {
        const supports = snapshot.val() || {};
        updateMapColors(supports);
        updateTopCountries(supports);
    });

    // Listen for total supports
    window.db.ref('totalSupports').on('value', snapshot => {
        const total = snapshot.val() || 0;
        document.getElementById('total-counter').textContent = total.toLocaleString();
    });
}

function updateMapColors(supports) {
    const maxSupport = Math.max(...Object.values(supports));
    
    Object.entries(supports).forEach(([countryCode, count]) => {
        const intensity = count / maxSupport;
        const element = document.querySelector(`#country-${countryCode}`);
        if (element) {
            element.style.fill = `rgba(20, 153, 84, ${intensity})`;
            if (intensity > 0.3) {
                element.classList.add('country-glow');
            }
        }
    });
}

function updateTopCountries(supports) {
    const sortedCountries = Object.entries(supports)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    const list = document.getElementById('top-countries');
    list.innerHTML = sortedCountries
        .map(([code, count]) => `<li>${code}: ${count.toLocaleString()} supports</li>`)
        .join('');
}

// Initialize dashboard when document is ready
document.addEventListener('DOMContentLoaded', initDashboard);
