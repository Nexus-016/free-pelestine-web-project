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
        worldMap.innerHTML = ''; // Clear existing content
        
        // Create simple SVG world map
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 1000 500');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', 'auto');
        svg.style.backgroundColor = '#1E1E1E';

        // Add major countries with simple shapes
        const countries = {
            'PS': { name: 'Palestine', path: 'M550,220 l20,0 l0,20 l-20,0 z' },
            'IL': { name: 'Israel', path: 'M550,200 l20,0 l0,20 l-20,0 z' },
            'USA': { name: 'United States', path: 'M200,180 l60,0 l0,30 l-60,0 z' },
            'GBR': { name: 'United Kingdom', path: 'M470,150 l20,0 l0,20 l-20,0 z' },
            'IND': { name: 'India', path: 'M650,220 l40,0 l0,40 l-40,0 z' },
            'CHN': { name: 'China', path: 'M700,180 l60,0 l0,40 l-60,0 z' },
            'RUS': { name: 'Russia', path: 'M600,100 l100,0 l0,50 l-100,0 z' },
            'BRA': { name: 'Brazil', path: 'M300,300 l40,0 l0,40 l-40,0 z' },
            'BGD': { name: 'Bangladesh', path: 'M690,220 l20,0 l0,20 l-20,0 z' },
            'PAK': { name: 'Pakistan', path: 'M630,200 l30,0 l0,30 l-30,0 z' }
        };

        // Create countries
        Object.entries(countries).forEach(([code, data]) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', data.path);
            path.setAttribute('id', `country-${code}`);
            path.setAttribute('class', 'country');
            path.setAttribute('data-name', data.name);
            
            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = data.name;
            path.appendChild(title);

            svg.appendChild(path);
        });

        worldMap.appendChild(svg);

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
        console.error('Dashboard error:', error);
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
        console.error('Error updating map:', error);
    }
}

function updateTopCountries(countries) {
    try {
        const list = document.getElementById('top-countries');
        const sorted = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);
        
        list.innerHTML = sorted
            .map(([_, data]) => 
                `<li>${data.name}: ${data.count.toLocaleString()} supporters</li>`
            )
            .join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
