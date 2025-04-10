import { database } from "./firebase-config.js";
import { ref, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const accessCodeInput = document.getElementById("accessCode");
    const unlockButton = document.getElementById("unlockButton");
    const toolsSection = document.getElementById("toolsSection");
    const clearCacheButton = document.getElementById("clearCacheButton");
    const clearDatabaseButton = document.getElementById("clearDatabaseButton");
    const reloadPageButton = document.getElementById("reloadPageButton");

    const ACCESS_CODE = "nexus"; // The secret access code

    // Unlock developer tools
    unlockButton.addEventListener("click", () => {
        const enteredCode = accessCodeInput.value;
        if (enteredCode === ACCESS_CODE) {
            toolsSection.classList.remove("hidden");
            alert("Developer tools unlocked!");
        } else {
            alert("Incorrect access code!");
        }
    });

    // Clear browser cache
    clearCacheButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the browser cache?")) {
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName);
                });
            });
            alert("Browser cache cleared!");
        }
    });

    // Clear the Firebase database
    clearDatabaseButton.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear the entire database? This action cannot be undone!")) {
            try {
                await remove(ref(database));
                alert("Database cleared successfully!");
            } catch (error) {
                console.error("Error clearing database:", error);
                alert("Failed to clear the database. Check the console for details.");
            }
        }
    });

    // Reload the page
    reloadPageButton.addEventListener("click", () => {
        location.reload();
    });
});
