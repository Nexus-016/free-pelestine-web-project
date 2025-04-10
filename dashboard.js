import { db } from './firebase-config.js';
import { ref, onValue } from 'firebase/database';

let worldMap;
let supportData = {};

async function initDashboard() {
    // Load world map data
    const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
    const topology = await response.json();
    const countries = topojson.feature(topology, topology.objects.countries);

    // Set up D3 map
    const width = 1000;
    const height = 600;
    const svg = d3.select('#world-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], countries);

    const path = d3.geoPath().projection(projection);

    // Draw countries
    svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'country')
        .attr('id', d => `country-${d.id}`);

    // Listen to Firebase updates
    const supportsRef = ref(db, 'supports');
    onValue(supportsRef, (snapshot) => {
        supportData = snapshot.val() || {};
        updateMapVisualization();
        updateCounterAndList();
    });
}

function updateMapVisualization() {
    const maxSupports = Math.max(...Object.values(supportData));
    
    Object.entries(supportData).forEach(([countryCode, count]) => {
        const intensity = count / maxSupports;
        const element = document.querySelector(`#country-${countryCode}`);
        if (element) {
            element.style.fill = `rgba(20, 153, 84, ${intensity})`;
            if (intensity > 0.5) {
                element.classList.add('country-glow');
            }
        }
    });
}

function updateCounterAndList() {
    const total = Object.values(supportData).reduce((a, b) => a + b, 0);
    document.getElementById('total-counter').textContent = total.toLocaleString();

    const topCountries = Object.entries(supportData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    const list = document.getElementById('top-countries');
    list.innerHTML = topCountries
        .map(([code, count]) => `<li>${getCountryName(code)}: ${count.toLocaleString()}</li>`)
        .join('');
}

initDashboard();
