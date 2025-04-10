document.addEventListener("DOMContentLoaded", async () => {
    const newsContainer = document.getElementById("newsContainer");

    // Fetch news data from an API or local JSON file
    async function fetchNews() {
        try {
            const response = await fetch("https://newsapi.org/v2/top-headlines?country=us&category=general&apiKey=YOUR_NEWS_API_KEY");
            if (response.ok) {
                const data = await response.json();
                renderNews(data.articles);
            } else {
                console.error("Failed to fetch news:", response.status);
                newsContainer.innerHTML = "<p>Failed to load news. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching news:", error);
            newsContainer.innerHTML = "<p>Error loading news. Please check your connection.</p>";
        }
    }

    // Render news articles on the page
    function renderNews(articles) {
        newsContainer.innerHTML = ""; // Clear existing content
        if (articles.length === 0) {
            newsContainer.innerHTML = "<p>No news articles available at the moment.</p>";
            return;
        }

        articles.forEach((article) => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");

            newsItem.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.description || "No description available."}</p>
                <a href="${article.url}" target="_blank">Read more</a>
            `;

            newsContainer.appendChild(newsItem);
        });
    }

    // Fetch and display news on page load
    await fetchNews();
});
