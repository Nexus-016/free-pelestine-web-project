const db = firebase.database();

let supportCount = 0;

function hasUserAlreadySupported() {
    return localStorage.getItem('palestine_support_recorded') === 'true';
}

function markUserAsSupported() {
    localStorage.setItem('palestine_support_recorded', 'true');
}

async function getUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            country: data.country,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}

document.getElementById('support-btn').addEventListener('click', async function() {
    if (hasUserAlreadySupported()) {
        alert('You have already shown your support. Thank you!');
        this.disabled = true;
        return;
    }

    const button = this;
    const checkbox = this.querySelector('.checkbox-tick');
    
    button.disabled = true;
    const originalButtonHtml = button.innerHTML;
    button.innerHTML += '<span class="loading"> Loading...</span>';
    
    try {
        const locationData = await getUserLocation();
        
        if (locationData) {
            const ipHash = await generateIPHash();
            const ipCheckRef = db.ref(`ip_checks/${ipHash}`);
            const ipSnapshot = await ipCheckRef.get();

            if (ipSnapshot.exists()) {
                alert('Support has already been recorded from this location.');
                button.disabled = false;
                button.innerHTML = originalButtonHtml;
                return;
            }

            // Add show class to checkbox tick
            checkbox.classList.add('show');
            
            // Update Firebase
            const updates = {};
            updates[`supports/${locationData.country}`] = firebase.database.ServerValue.increment(1);
            updates[`ip_checks/${ipHash}`] = true;
            updates['totalSupports'] = firebase.database.ServerValue.increment(1);

            await db.ref().update(updates);

            // Mark user as supported
            markUserAsSupported();
            
            // Update UI
            document.getElementById('thank-you').classList.remove('hidden');
            document.getElementById('share-section').classList.remove('hidden');
            await updateSupporterCount();
            
            // Update button state
            button.innerHTML = originalButtonHtml;
            checkbox.classList.add('show');
            button.disabled = true;
        }
    } catch (error) {
        console.error('Error recording support:', error);
        alert('There was an error recording your support. Please try again.');
        button.disabled = false;
        button.innerHTML = originalButtonHtml;
    } finally {
        button.querySelector('.loading')?.remove();
    }
});

// When checking if user already supported on page load
document.addEventListener('DOMContentLoaded', function() {
    updateSupporterCount();
    if (hasUserAlreadySupported()) {
        const button = document.getElementById('support-btn');
        const checkbox = button.querySelector('.checkbox-tick');
        checkbox.classList.add('show');
        button.disabled = true;
    }
});

async function generateIPHash() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        
        // Create a simple hash of the IP
        const encoder = new TextEncoder();
        const data_buffer = encoder.encode(ip);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data_buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Error generating IP hash:', error);
        return null;
    }
}

async function updateSupporterCount() {
    const snapshot = await db.ref('totalSupports').get();
    const count = snapshot.val() || 0;
    document.getElementById('supporter-count').textContent = count.toLocaleString();
}

// Initialize counter on page load
document.addEventListener('DOMContentLoaded', function() {
    updateSupporterCount();
    if (hasUserAlreadySupported()) {
        const button = document.getElementById('support-btn');
        button.disabled = true;
        button.innerHTML = 'Already Supported ✓';
    }
});

function share(platform) {
    const text = "I just stood with Palestine. Join thousands of others: ";
    const url = window.location.href;
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    }
}

// Add this to test the connection
db.ref('test').on('value', (snapshot) => {
    console.log('Firebase connection successful');
});

// You can add Firebase configuration here for real-time counter
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue } from 'firebase/database';
// ... Firebase setup code ...
