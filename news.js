class NewsCache {
    constructor() {
        this.CACHE_KEY = 'palestine_news_cache';
        this.CACHE_DURATION = 3600000; // 1 hour in milliseconds
        this.API_CALLS_KEY = 'gnews_api_calls';
        this.API_RESET_KEY = 'gnews_api_reset';
        this.DAILY_LIMIT = 100;
    }

    async loadNews(apiKey) {
        try {
            // Check API call limits
            if (!this.canMakeApiCall()) {
                console.log('API daily limit reached, using cache only');
                return this.getCachedNews();
            }

            // Check cache first
            const cachedData = this.getCachedNews();
            if (cachedData && !this.isCacheExpired(cachedData.timestamp)) {
                console.log('Using cached news');
                return cachedData.articles;
            }

            // Fetch fresh news
            console.log('Fetching fresh news');
            const url = `https://gnews.io/api/v4/search?q=palestine+gaza+israel&lang=en&max=10&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.articles) {
                // Update cache
                this.cacheNews(data.articles);
                // Increment API call counter
                this.incrementApiCalls();
                return data.articles;
            }

            throw new Error('No articles in response');
        } catch (error) {
            console.error('News fetch error:', error);
            // Return cached news as fallback
            const cachedData = this.getCachedNews();
            return cachedData ? cachedData.articles : null;
        }
    }

    getCachedNews() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    }

    cacheNews(articles) {
        const cacheData = {
            articles,
            timestamp: Date.now()
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    }

    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.CACHE_DURATION;
    }

    canMakeApiCall() {
        const today = new Date().toDateString();
        const resetDate = localStorage.getItem(this.API_RESET_KEY);
        const calls = parseInt(localStorage.getItem(this.API_CALLS_KEY) || '0');

        // Reset counter if it's a new day
        if (resetDate !== today) {
            localStorage.setItem(this.API_RESET_KEY, today);
            localStorage.setItem(this.API_CALLS_KEY, '0');
            return true;
        }

        return calls < this.DAILY_LIMIT;
    }

    incrementApiCall() {
        const calls = parseInt(localStorage.getItem(this.API_CALLS_KEY) || '0');
        localStorage.setItem(this.API_CALLS_KEY, (calls + 1).toString());
    }

    getApiCallsRemaining() {
        const calls = parseInt(localStorage.getItem(this.API_CALLS_KEY) || '0');
        return this.DAILY_LIMIT - calls;
    }
}

// Export for use
window.NewsCache = NewsCache;
