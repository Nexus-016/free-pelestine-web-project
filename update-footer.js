// Simple script to include the footer in all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on dashboard page with direct footer implementation
    if (document.getElementById('footer-placeholder')) {
        console.log('Using direct footer implementation for dashboard');
        loadFooter(document.getElementById('footer-placeholder'));
        return;
    }
    
    // If we don't have a page-container, create proper page structure
    if (!document.querySelector('.page-container')) {
        // Save current body content
        const originalContent = document.body.innerHTML;
        
        // Create proper structure
        document.body.innerHTML = `
            <div class="page-container">
                ${originalContent}
                <div id="footer-placeholder"></div>
            </div>
        `;
        
        // Load footer
        loadFooter(document.getElementById('footer-placeholder'));
    }
    
    /**
     * Load footer content into target element
     */
    function loadFooter(targetElement) {
        if (!targetElement) return;
        
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load footer: ${response.status}`);
                return response.text();
            })
            .then(data => {
                targetElement.outerHTML = data;
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                targetElement.innerHTML = `
                    <footer class="footer simple-footer">
                        <div class="footer-bottom">
                            <p>&copy; 2023 Stand with Palestine. All Rights Reserved.</p>
                        </div>
                    </footer>
                `;
            });
    }
    
    // Add a failsafe - if footer isn't loaded within 3 seconds, show simple version
    setTimeout(function() {
        if (!document.querySelector('.footer')) {
            console.warn('Footer failed to load, showing simple version');
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = `
                    <footer class="footer simple-footer">
                        <div class="footer-bottom">
                            <p>&copy; 2023 Stand with Palestine. All Rights Reserved.</p>
                        </div>
                    </footer>
                `;
            }
        }
    }, 3000);
});
