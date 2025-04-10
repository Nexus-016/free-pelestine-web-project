// Remove the imports and use global Firebase
// const db = window.db from index.html initialization

// Add country code mapping
const countryCodeMap = {
    'BGD': 'BD', // Bangladesh
    'IND': 'IN', // India
    'PAK': 'PK', // Pakistan
    'USA': 'US', // United States
    // Add more mappings as needed
};

// Initialize the map
async function initDashboard() {
    try {
        const worldMap = document.getElementById('world-map');
        const width = worldMap.clientWidth;
        const height = width * 0.5;
        
        // Create basic SVG map
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 1000 500');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        
        // Add simple country shapes (rectangles for testing)
        const countries = {
            'PS': { name: 'Palestine', x: 500, y: 250, w: 20, h: 20 },
            'US': { name: 'United States', x: 200, y: 200, w: 40, h: 30 },
            'GB': { name: 'United Kingdom', x: 450, y: 150, w: 20, h: 20 },
            // Add more countries as needed
        };

        Object.entries(countries).forEach(([code, data]) => {
            const country = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            country.setAttribute('id', `country-${code}`);
            country.setAttribute('x', data.x);
            country.setAttribute('y', data.y);
            country.setAttribute('width', data.w);
            country.setAttribute('height', data.h);
            country.setAttribute('class', 'country');
            svg.appendChild(country);
        });

        worldMap.appendChild(svg);

        // Listen for Firebase updates
        window.db.ref('countries').on('value', snapshot => {
            const data = snapshot.val() || {};
            updateMapColors(data);
            updateTopCountries(data);
        });

        window.db.ref('totalSupports').on('value', snapshot => {
            document.getElementById('total-counter').textContent = 
                (snapshot.val() || 0).toLocaleString();
        });
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

function updateMapColors(countries) {
    Object.entries(countries).forEach(([code, data]) => {
        const element = document.querySelector(`#country-${code}`);
        if (element) {
            const count = data.count || 0;
            element.classList.remove('low-support', 'medium-support', 'high-support');
            if (count >= 20) element.classList.add('high-support');
            else if (count >= 10) element.classList.add('medium-support');
            else if (count >= 1) element.classList.add('low-support');
            
            element.setAttribute('title', `${data.name}: ${count} supporters`);
        }
    });
}

function updateTopCountries(countries) {
    const list = document.getElementById('top-countries');
    const sorted = Object.entries(countries)
        .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
        .slice(0, 10);
    
    list.innerHTML = sorted
        .map(([_, data]) => `<li>${data.name}: ${data.count} supporters</li>`)
        .join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);
