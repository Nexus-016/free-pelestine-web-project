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
                const cachedData = this.getCachedNews();
                return cachedData ? cachedData.articles : [];
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
            
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
            
            const data = await response.json();

            if (data.articles && Array.isArray(data.articles)) {
                // Update cache
                this.cacheNews(data.articles);
                // Increment API call counter
                this.incrementApiCalls();
                return data.articles;
            } else if (data.errors) {
                throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
            }

            throw new Error('No articles in response or invalid response format');
        } catch (error) {
            console.error('News fetch error:', error);
            // Return cached news as fallback
            const cachedData = this.getCachedNews();
            return cachedData ? cachedData.articles : [];
        }
    }

    getCachedNews() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error parsing cached news:', error);
            localStorage.removeItem(this.CACHE_KEY);
            return null;
        }
    }

    cacheNews(articles) {
        try {
            const cacheData = {
                articles,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error caching news:', error);
        }
    }

    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.CACHE_DURATION;
    }

    canMakeApiCall() {
        try {
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
        } catch (error) {
            console.error('Error checking API call limits:', error);
            return true; // Allow calls if we can't check limits
        }
    }

    incrementApiCalls() {
        try {
            const calls = parseInt(localStorage.getItem(this.API_CALLS_KEY) || '0');
            localStorage.setItem(this.API_CALLS_KEY, (calls + 1).toString());
        } catch (error) {
            console.error('Error incrementing API calls:', error);
        }
    }

    getApiCallsRemaining() {
        try {
            const calls = parseInt(localStorage.getItem(this.API_CALLS_KEY) || '0');
            return this.DAILY_LIMIT - calls;
        } catch (error) {
            console.error('Error getting API calls remaining:', error);
            return 'unknown';
        }
    }
}

// Export for use in browser context
window.NewsCache = NewsCache;
