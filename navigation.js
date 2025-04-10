document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

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
});
