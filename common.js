/**
 * Common JavaScript functions for all pages
 * Handles navigation, responsiveness and UI fixes
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Common.js loaded');
    
    // Fix header navigation links
    fixNavigationLinks();
    
    // Handle window resize events
    window.addEventListener('resize', function() {
        fixNavigationLinks();
    });
    
    // Make sure active page is highlighted correctly
    highlightActivePage();
    
    // Fix any links that might be broken
    fixPageLinks();
});

/**
 * Fix navigation links for responsive layout
 */
function fixNavigationLinks() {
    const header = document.querySelector('.header');
    const navLinks = document.querySelector('.nav-links');
    
    if (!header || !navLinks) return;
    
    // Ensure header is full width
    header.style.width = '100%';
    
    // Adjust padding based on screen size
    if (window.innerWidth <= 480) {
        header.style.padding = '0.5rem 0';
    } else if (window.innerWidth <= 768) {
        header.style.padding = '0.6rem 0';
    } else {
        header.style.padding = '0.75rem 0';
    }
    
    // Fix any missing classes on nav links
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        if (!link.getAttribute('href')) {
            link.setAttribute('href', '#');
        }
        
        // Fix any link styles
        link.style.textDecoration = 'none';
        link.style.display = 'inline-block';
    });
}

/**
 * Highlight the active page in navigation
 */
function highlightActivePage() {
    // Get the current page pathname
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    
    // Get all navigation links
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');
        
        // Get the href value
        const href = link.getAttribute('href');
        
        // If no href, skip this link
        if (!href) return;
        
        // Check if this link matches the current page
        if (pageName === href || 
            (pageName === '' && href === 'index.html') ||
            (path.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Fix any broken links on the page
 */
function fixPageLinks() {
    // Fix donation links
    const donationLinks = document.querySelectorAll('.donation-link');
    
    donationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default only if it's a placeholder (#)
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                console.log('Placeholder link clicked');
            }
        });
    });
    
    // Fix social profile links
    const socialLinks = document.querySelectorAll('.social-profile-link');
    
    socialLinks.forEach(link => {
        // Make sure these links open in a new tab
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Prevent default behavior for placeholder links
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Placeholder social link clicked');
            });
        }
    });
    
    // Fix support button if it exists
    const supportBtn = document.getElementById('support-btn');
    if (supportBtn) {
        supportBtn.style.cursor = 'pointer';
    }
}
