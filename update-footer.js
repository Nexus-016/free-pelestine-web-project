/**
 * Simplified footer script
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if footer already exists
    if (document.querySelector('.footer')) {
        return;
    }
    
    // Create a simple footer element directly
    const simpleFooter = document.createElement('footer');
    simpleFooter.className = 'footer';
    simpleFooter.innerHTML = `
        <div class="footer-bottom">
            <p>&copy; 2023 Stand with Palestine. All Rights Reserved.</p>
            <p>Made with solidarity for peace and human rights.</p>
        </div>
    `;
    
    // Check for footer placeholder (for dashboard)
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.replaceWith(simpleFooter);
    } else {
        // Append to body
        document.body.appendChild(simpleFooter);
    }
});
