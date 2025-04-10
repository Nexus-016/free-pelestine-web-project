document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    // Ensure both elements exist before adding event listeners
    if (menuToggle && navMenu) {
        // Toggle navigation menu visibility on mobile
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        // Close the menu when a link is clicked
        navMenu.addEventListener("click", (event) => {
            if (event.target.classList.contains("nav-link")) {
                navMenu.classList.remove("active");
            }
        });
    } else {
        console.error("Menu toggle or navigation menu not found.");
    }
});
