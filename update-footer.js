/**
 * More robust footer script that works with all page layouts
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if footer already exists (avoid double loading)
    if (document.querySelector('.footer')) {
        console.log('Footer already exists');
        return;
    }
    
    // Check for dashboard-specific footer placeholder
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        // Dashboard page - use the placeholder
        loadFooterContent(footerPlaceholder);
    } else {
        // Other pages - append to body
        const footer = document.createElement('footer');
        footer.className = 'footer';
        document.body.appendChild(footer);
        loadFooterContent(footer);
    }
    
    /**
     * Load footer content into the target element
     */
    function loadFooterContent(target) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load footer');
                }
                return response.text();
            })
            .then(html => {
                if (target.id === 'footer-placeholder') {
                    // For dashboard, replace the placeholder
                    target.outerHTML = html;
                } else {
                    // For other pages, insert content
                    target.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                // Simple fallback footer
                target.innerHTML = `
                    <div class="footer-container">
                        <div class="footer-section">
                            <div class="footer-logo">Stand with <span>Palestine</span></div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2023 Stand with Palestine. All Rights Reserved.</p>
                    </div>
                `;
            });
    }
});
