function initDashboard() {
    window.addEventListener('mapDataReady', () => {
        const worldMap = document.getElementById('world-map');
        if (!worldMap) return;

        worldMap.innerHTML = '';
        const width = worldMap.clientWidth;
        const height = width * 0.5;
        
        const svg = d3.select('#world-map')
            .append('svg')
            .attr('viewBox', '0 0 960 480')
            .attr('width', width)
            .attr('height', height);

        // Create projection
        const projection = d3.geoMercator()
            .fitSize([960, 480], window.mapData);

        // Create path generator
        const path = d3.geoPath().projection(projection);

        // Draw countries
        svg.selectAll('path')
            .data(window.mapData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => `country-${d.id}`)
            .attr('class', 'country')
            .attr('data-name', d => d.properties.name);

        // Set up Firebase listeners
        window.db.ref('countries').on('value', updateMapColors);
        window.db.ref('totalSupports').on('value', updateTotalCounter);
    });
}

function updateMapColors(snapshot) {
    try {
        const countries = snapshot.val() || {};
        const maxSupport = Math.max(...Object.values(countries).map(c => c.count || 0));
        
        // Reset all countries
        document.querySelectorAll('.country').forEach(el => {
            el.classList.remove('high-support', 'medium-support', 'low-support');
        });

        // Update countries with support and glow effects
        Object.entries(countries).forEach(([code, data]) => {
            const count = data.count || 0;
            const element = document.querySelector(`#country-${code}`);
            
            if (element) {
                // Calculate support level based on count
                if (count >= maxSupport * 0.7) {
                    element.classList.add('high-support');
                } else if (count >= maxSupport * 0.3) {
                    element.classList.add('medium-support');
                } else if (count > 0) {
                    element.classList.add('low-support');
                }

                // Add tooltip with support count
                element.setAttribute('title', `${data.name}: ${count.toLocaleString()} supporters`);
                
                // Add data attributes for filtering
                element.setAttribute('data-support-count', count);
                element.setAttribute('data-country-name', data.name);
            }
        });

        // Update top countries list with glow indicators
        updateTopCountries(countries);

    } catch (error) {
        console.error('[Dashboard] Map update error:', error);
    }
}

function updateTotalCounter(snapshot) {
    try {
        document.getElementById('total-counter').textContent = 
            (snapshot.val() || 0).toLocaleString();
    } catch (error) {
        console.error('[Dashboard] Total counter update error:', error);
    }
}

function updateTopCountries(countries) {
    try {
        const list = document.getElementById('top-countries');
        const sorted = Object.entries(countries)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0))
            .slice(0, 10);
        
        list.innerHTML = sorted.map(([code, data]) => {
            const supportClass = getSupportClass(data.count);
            return `
                <li class="${supportClass}">
                    ${data.name}: ${data.count.toLocaleString()} supporters
                </li>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating top countries:', error);
    }
}

function getSupportClass(count) {
    // Helper function to determine support class
    if (count >= 20) return 'high-support';
    if (count >= 10) return 'medium-support';
    if (count >= 1) return 'low-support';
    return '';
}

document.addEventListener('DOMContentLoaded', initDashboard);
