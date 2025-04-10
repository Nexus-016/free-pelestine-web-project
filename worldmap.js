const WorldMap = {
    // Use countries data from external file
    countries: window.CountriesData,

    createMap: function(container, width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 1000 500');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.backgroundColor = '#1E1E1E';

        // Create group for map
        const mapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create paths for each country
        Object.entries(this.countries).forEach(([code, country]) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', country.path);
            path.setAttribute('id', `country-${code}`);
            path.setAttribute('class', 'country');
            path.setAttribute('data-name', country.name);
            
            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = country.name;
            path.appendChild(title);

            // Add click handler
            path.onclick = () => {
                console.log(`Clicked ${country.name} (${code})`);
            };

            mapGroup.appendChild(path);
        });

        svg.appendChild(mapGroup);
        container.appendChild(svg);

        // Add pan and zoom functionality
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let currentTranslate = { x: 0, y: 0 };

        svg.addEventListener('mousedown', (e) => {
            isPanning = true;
            startPoint = {
                x: e.clientX - currentTranslate.x,
                y: e.clientY - currentTranslate.y
            };
        });

        svg.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            currentTranslate = {
                x: e.clientX - startPoint.x,
                y: e.clientY - startPoint.y
            };
            mapGroup.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
        });

        svg.addEventListener('mouseup', () => {
            isPanning = false;
        });

        svg.addEventListener('mouseleave', () => {
            isPanning = false;
        });

        // Add zoom with mouse wheel
        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 0.9 : 1.1;
            const currentScale = parseFloat(mapGroup.getAttribute('data-scale') || 1);
            const newScale = Math.min(Math.max(currentScale * scale, 0.5), 4);
            mapGroup.setAttribute('data-scale', newScale);
            mapGroup.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px) scale(${newScale})`;
        });

        return svg;
    }
};

window.WorldMap = WorldMap;
