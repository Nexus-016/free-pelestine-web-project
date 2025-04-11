// Simple script to include the footer in all pages
document.addEventListener('DOMContentLoaded', function() {
    // Load footer content
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            // Insert footer before end of body
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});
