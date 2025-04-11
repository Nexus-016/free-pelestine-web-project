// Simple script to include the footer in all pages
document.addEventListener('DOMContentLoaded', function() {
    // Wrap the existing content in a page-content div
    const bodyContent = document.body.innerHTML;
    
    // Create page structure with content wrapper and footer placeholder
    document.body.innerHTML = `
        <div class="page-content">
            ${bodyContent}
        </div>
        <div id="footer-placeholder"></div>
    `;
    
    // Load footer content
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            // Insert footer
            document.getElementById('footer-placeholder').outerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});
