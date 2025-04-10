// Add new function for getting location
async function getLocationData() {
    try {
        // First try: ipapi.co with JSONP to avoid CORS
        const response = await fetch('https://ipapi.co/json/', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Location data from ipapi:', data);
            return {
                country: data.country_code || data.country || 'UNKNOWN',
                city: data.city || 'UNKNOWN',
                latitude: data.latitude || 0,
                longitude: data.longitude || 0
            };
        }

        // Backup API: ip-api.com
        const backupResponse = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,city,lat,lon');
        if (backupResponse.ok) {
            const data = await backupResponse.json();
            console.log('Location data from ip-api:', data);
            return {
                country: data.countryCode || data.country || 'UNKNOWN',
                city: data.city || 'UNKNOWN',
                latitude: data.lat || 0,
                longitude: data.lon || 0
            };
        }

        throw new Error('Failed to fetch location data');
    } catch (error) {
        console.error('Location fetch error:', error);
        
        // Last resort: Use a serverless function or proxy
        try {
            const fallbackResponse = await fetch('https://api.db-ip.com/v2/free/self');
            const data = await fallbackResponse.json();
            console.log('Location data from db-ip:', data);
            return {
                country: data.countryCode || 'UNKNOWN',
                city: data.city || 'UNKNOWN',
                latitude: 0,
                longitude: 0
            };
        } catch (e) {
            console.error('All location APIs failed:', e);
            return {
                country: 'UNKNOWN',
                city: 'UNKNOWN',
                latitude: 0,
                longitude: 0
            };
        }
    }
}

// Update handleSupport function
async function handleSupport(button) {
    console.log('Support handler called');
    const checkbox = button.querySelector('.checkbox-tick');
    
    try {
        // Show checkbox immediately for feedback
        checkbox.classList.add('show');
        button.disabled = true;

        // Try to get location data with timeout
        const locationPromise = getLocationData();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout')), 5000)
        );

        const locationData = await Promise.race([locationPromise, timeoutPromise])
            .catch(error => {
                console.warn('Location fetch timed out:', error);
                return {
                    country: 'UNKNOWN',
                    city: 'UNKNOWN',
                    latitude: 0,
                    longitude: 0
                };
            });

        console.log('Location data:', locationData);

        // Prepare updates for Firebase
        const updates = {};
        updates['totalSupports'] = firebase.database.ServerValue.increment(1);
        
        if (locationData && locationData.country !== 'UNKNOWN') {
            updates[`supports/${locationData.country}`] = firebase.database.ServerValue.increment(1);
            updates[`supporters/${Date.now()}`] = {
                country: locationData.country,
                city: locationData.city,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                latitude: locationData.latitude,
                longitude: locationData.longitude
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
