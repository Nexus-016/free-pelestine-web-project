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
            el.style.transition = 'all 0.5s ease';
        });

        // Update countries with support and glow effects
        Object.entries(countries).forEach(([code, data]) => {
            const count = data.count || 0;
            const element = document.querySelector(`#country-${code}`);
            
            if (element) {
                // Remove old classes
                element.classList.remove('high-support', 'medium-support', 'low-support');
                
                // Calculate percentage of max support
                const percentage = (count / maxSupport) * 100;

                // Add new class based on support level
                if (percentage >= 70) {
                    element.classList.add('high-support');
                } else if (percentage >= 30) {
                    element.classList.add('medium-support');
                } else if (count > 0) {
                    element.classList.add('low-support');
                }

                // Add tooltip
                element.setAttribute('title', `${data.name}: ${count.toLocaleString()} supporters`);
                
                // Add custom glow intensity based on exact count
                const glowIntensity = Math.min(1, count / 20); // Normalize to max 1
                const glowColor = `rgba(228, 49, 43, ${glowIntensity})`;
                element.style.filter = `
                    drop-shadow(0 0 ${5 + (glowIntensity * 10)}px ${glowColor})
                    drop-shadow(0 0 ${10 + (glowIntensity * 20)}px ${glowColor})
                `;
            }
        });

        // Update top countries list
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

function initializeRealtimeUpdates() {
    window.db.ref('countries').on('value', snapshot => {
        updateMapColors(snapshot);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initializeRealtimeUpdates();
});
