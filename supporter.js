import { ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

export async function fetchSupporterData(databaseRef, countries, updateSupportCount) {
    try {
        console.log("Fetching supporter data...");
        const snapshot = await get(databaseRef);
        let supporterData = {};

        if (snapshot.exists()) {
            supporterData = snapshot.val();
            console.log("Fetched supporter data:", supporterData);
        } else {
            console.warn("No supporter data found. Defaulting to 0 for all countries.");
        }

        // Ensure all countries have a default count of 0
        Object.keys(countries).forEach((country) => {
            if (!supporterData[country]) {
                supporterData[country] = 0;
            }
        });

        updateSupportCount(supporterData);
    } catch (error) {
        console.error("Error fetching supporter data:", error);
    }
}

export function updateSupportCount(supporterData, supportCountElement) {
    let totalSupporters = 0;

    // Calculate total supporters
    Object.values(supporterData).forEach((count) => {
        if (typeof count === "number") {
            totalSupporters += count;
        } else {
            console.warn("Invalid data detected in supporterData:", count);
        }
    });

    supportCountElement.textContent = `${totalSupporters} people have supported so far.`;
}
