// Add country name mapping
const countryNames = {
    'BD': 'Bangladesh',
    'IN': 'India',
    'PK': 'Pakistan',
    'US': 'United States',
    // Add more as needed...
};

async function getLocationData() {
    try {
        // Try db-ip API directly since it works
        const response = await fetch('https://api.db-ip.com/v2/free/self');
        const data = await response.json();
        console.log('Location data:', data);
        
        return {
            country: data.countryCode || 'UNKNOWN',
            countryName: data.countryName || 'Unknown Country'
        };
    } catch (error) {
        console.error('Location fetch error:', error);
        return {
            country: 'UNKNOWN',
            countryName: 'Unknown Country'
        };
    }
}

// Update handleSupport function
async function handleSupport(button) {
    console.log('Support handler called');
    const checkbox = button.querySelector('.checkbox-tick');
    
    try {
        checkbox.classList.add('show');
        button.disabled = true;

        const locationData = await getLocationData();
        console.log('Location data:', locationData);

        // Simplified updates for Firebase
        const updates = {};
        updates['totalSupports'] = firebase.database.ServerValue.increment(1);
        
        if (locationData.country !== 'UNKNOWN') {
            updates[`countries/${locationData.country}`] = {
                name: locationData.countryName,
                count: firebase.database.ServerValue.increment(1)
            };
        }

        // Update Firebase
        await window.db.ref().update(updates);
        console.log('Support recorded');

        // Update UI
        document.getElementById('thank-you').classList.remove('hidden');
        document.getElementById('share-section').classList.remove('hidden');
        localStorage.setItem('palestine_support_recorded', 'true');
        updateSupporterCount();

    } catch (error) {
        console.error('Error:', error);
        // Still count the support even if location fails
        try {
            await window.db.ref('totalSupports').transaction(current => (current || 0) + 1);
            document.getElementById('thank-you').classList.remove('hidden');
            document.getElementById('share-section').classList.remove('hidden');
            localStorage.setItem('palestine_support_recorded', 'true');
            updateSupporterCount();
        } catch (e) {
            alert('Error recording support. Please try again.');
            checkbox.classList.remove('show');
            button.disabled = false;
        }
    }
}

// Update supporter count function
async function updateSupporterCount() {
    const snapshot = await window.db.ref('totalSupports').get();
    const count = snapshot.val() || 0;
    document.getElementById('supporter-count').textContent = count.toLocaleString();
}

// Add click listener when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    const button = document.getElementById('support-btn');
    
    if (button) {
        // Check if already supported
        if (localStorage.getItem('palestine_support_recorded') === 'true') {
            button.disabled = true;
            button.querySelector('.checkbox-tick').classList.add('show');
            document.getElementById('thank-you').classList.remove('hidden');
            document.getElementById('share-section').classList.remove('hidden');
            updateSupporterCount();
        } else {
            // Add click handler
            button.onclick = handleSupport.bind(null, button);
        }
    }
});

// Simplified share function
function share(platform) {
    const text = "I just stood with Palestine. Join thousands of others: ";
    const url = window.location.href;
    window.open(platform === 'twitter' 
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    );
}

// Add this to test the connection
window.db.ref('test').on('value', (snapshot) => {
    console.log('Firebase connection successful');
});

// You can add Firebase configuration here for real-time counter
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue } from 'firebase/database';
// ... Firebase setup code ...

// Add this at the end of the file
async function resetSupport() {
    try {
        // Clear localStorage
        localStorage.removeItem('palestine_support_recorded');
        
        // Reset button state
        const button = document.getElementById('support-btn');
        button.disabled = false;
        button.querySelector('.checkbox-tick').classList.remove('show');
        
        // Hide thank you and share sections
        document.getElementById('thank-you').classList.add('hidden');
        document.getElementById('share-section').classList.add('hidden');
        
        // Reset IP check in Firebase
        const ipHash = await generateIPHash();
        await window.db.ref(`ip_checks/${ipHash}`).remove();
        
        console.log('Support reset successful');
        location.reload(); // Refresh the page
    } catch (error) {
        console.error('Error resetting support:', error);
        alert('Error resetting support. Please try again.');
    }
}
