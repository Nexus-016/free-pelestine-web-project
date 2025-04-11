// Add country name mapping
const countryNames = {
    'BD': 'Bangladesh',
    'IN': 'India',
    'PK': 'Pakistan',
    'US': 'United States',
    // Add more as needed...
};

// Add at the top of file
const API_LIMITS = {
    'db-ip': 1000, // 1000 requests per day
    'ipapi': 1000, // 1000 requests per day
    'ipwho': 10000 // 10000 requests per day
};

// Update getLocationData function
async function getLocationData() {
    // Try multiple APIs in sequence
    const apis = [
        {
            url: 'https://api.db-ip.com/v2/free/self',
            handler: (data) => ({
                country: data.countryCode,
                countryName: data.countryName
            })
        },
        {
            url: 'https://ipwho.is/',
            handler: (data) => ({
                country: data.country_code,
                countryName: data.country
            })
        },
        {
            url: 'https://ipapi.co/json/',
            handler: (data) => ({
                country: data.country_code,
                countryName: data.country_name
            })
        }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.url}...`);
            const response = await fetch(api.url);
            if (!response.ok) {
                console.log(`Failed with status: ${response.status}`);
                continue;
            }
            const data = await response.json();
            console.log('API Response:', data);
            
            return api.handler(data);
        } catch (error) {
            console.log(`API failed:`, error);
            continue;
        }
    }

    // If all APIs fail, return unknown
    console.warn('All location APIs failed');
    return {
        country: 'UNKNOWN',
        countryName: 'Unknown Country'
    };
}

// Update handleSupport function to handle rate limits
async function handleSupport(button) {
    console.log('Support handler called');
    const checkbox = button.querySelector('.checkbox-tick');
    
    try {
        checkbox.classList.add('show');
        button.disabled = true;

        const locationData = await getLocationData();
        console.log('Location data:', locationData);

        if (locationData.country === 'UNKNOWN') {
            // Still record support but inform about location issue
            const updates = {
                'totalSupports': firebase.database.ServerValue.increment(1),
                'unknownLocation': firebase.database.ServerValue.increment(1)
            };
            await window.db.ref().update(updates);
        } else {
            // Normal location update
            const updates = {};
            updates['totalSupports'] = firebase.database.ServerValue.increment(1);
            updates[`countries/${locationData.country}`] = {
                name: locationData.countryName,
                count: firebase.database.ServerValue.increment(1)
            };
            await window.db.ref().update(updates);
        }

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

// Detect mobile devices for customized experience
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}

// Enhanced sharing function with personalized message
async function share(platform) {
    try {
        // Get user's supporter number and country
        const totalSnapshot = await window.db.ref('totalSupports').get();
        const supporterNumber = totalSnapshot.val() || 0;
        
        // Get country info (fallback to stored location if API fails)
        let locationData = JSON.parse(localStorage.getItem('palestine_location_data') || '{}');
        if (!locationData.countryName) {
            try {
                locationData = await getLocationData();
                localStorage.setItem('palestine_location_data', JSON.stringify(locationData));
            } catch (error) {
                console.error('Error fetching location:', error);
                locationData = { countryName: "the world" };
            }
        }
        
        const country = locationData.countryName || "the world";
        
        // Create personalized message
        const text = `I am supporter #${supporterNumber.toLocaleString()} from ${country} standing with Palestine. Join me:`;
        const url = window.location.href;
        const hashTags = "FreePalestine,StandWithPalestine,HumanRights";
        
        // Use native sharing on mobile if available
        if (isMobileDevice() && navigator.share) {
            navigator.share({
                title: 'Stand with Palestine',
                text: text,
                url: url,
            }).catch(error => console.log('Error sharing:', error));
            return;
        }
        
        // Platform-specific sharing URLs
        let shareUrl;
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashTags}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=Stand with Palestine&body=${encodeURIComponent(text + '\n\n' + url)}`;
                break;
            default:
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashTags}`;
        }
        
        window.open(shareUrl, '_blank');
    } catch (error) {
        console.error('Error in share function:', error);
        // Fallback to basic sharing if anything fails
        const text = "Stand with Palestine. Join me:";
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
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
