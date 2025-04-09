document.addEventListener("DOMContentLoaded", () => {
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your GNews API key
    const url = `https://gnews.io/api/v4/search?q=palestine&lang=en&max=5&apikey=${apiKey}`;
    const CACHE_KEY = "cachedNews";
    const CACHE_TIMESTAMP_KEY = "newsCacheTimestamp";
    const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    const newsContainer = document.getElementById("news-container");

    // Fetch news from the API
    async function fetchNews() {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(CACHE_KEY, JSON.stringify(data.articles)); // Cache the news
                localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now()); // Cache the timestamp
                displayNews(data.articles);
            } else {
                console.error("Failed to fetch news:", response.status);
                newsContainer.innerHTML = "<p>Failed to load news. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching news:", error);
            newsContainer.innerHTML = "<p>Failed to load news. Please try again later.</p>";
        }
    }

    // Display news articles
    function displayNews(articles) {
        newsContainer.innerHTML = ""; // Clear existing content
        articles.forEach(article => {
            const div = document.createElement("div");
            div.style.marginBottom = "20px";
            div.innerHTML = `
                <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                <p>${article.description || ''}</p>
                <small>${new Date(article.publishedAt).toLocaleString()}</small>
                <hr>
            `;
            newsContainer.appendChild(div);
        });
    }

    // Check if cached news is still valid
    function isCacheValid() {
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) return false;
        const elapsedTime = Date.now() - parseInt(cachedTimestamp, 10);
        return elapsedTime < CACHE_DURATION;
    }

    // Load news (from cache or API)
    function loadNews() {
        if (isCacheValid()) {
            const cachedNews = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cachedNews) {
                displayNews(cachedNews);
                console.log("Loaded news from cache.");
            } else {
                fetchNews(); // Fallback to API if cache is empty
            }
        } else {
            fetchNews(); // Fetch fresh news if cache is expired
        }
    }

    // Load news on page load
    loadNews();
});
