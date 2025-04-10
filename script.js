// Simple function to handle the support action
function handleSupport(button) {
    console.log('Support handler called');
    const checkbox = button.querySelector('.checkbox-tick');
    
    // Show checkbox immediately for feedback
    checkbox.classList.add('show');
    button.disabled = true;

    // Simple Firebase update using global db
    window.db.ref('totalSupports').transaction(current => (current || 0) + 1)
        .then(() => {
            console.log('Support recorded');
            document.getElementById('thank-you').classList.remove('hidden');
            document.getElementById('share-section').classList.remove('hidden');
            localStorage.setItem('palestine_support_recorded', 'true');
            updateSupporterCount();
        })
        .catch(error => {
            console.error('Error:', error);
            checkbox.classList.remove('show');
            button.disabled = false;
        });
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
