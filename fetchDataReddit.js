async function fetchDataReddit(subreddits) {
    const outputData = []
    const fetch = await import('node-fetch');

    for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}.json`;

        try {
            const response = await fetch.default(url);

            console.log(`Respuesta para el subreddit ${subreddit}:`, response);

            const data = await response.json();

            data.data.children.forEach(post => {
                // Tomamos las variables que queremos rescatar de cada post
                const { id, title, subreddit, selftext, thumbnail, score, url, created_utc } = post.data;

                // Procesamos las variables antes de entregarlas
                const sanitizedThumbnail = thumbnail === 'self' ? '' : thumbnail;
                const time_created = new Date(created_utc * 1000);

                // Configuramos la respuesta
                outputData.push({ id, title, subreddit, selftext, sanitizedThumbnail, score, url, time_created })
            });
        } catch (error) {
            console.error(`Error fetching data for subreddit ${subreddit}:`, error);
        }
    }

    return outputData
}

module.exports = fetchDataReddit;

// Test
//const subreddits = ['RepublicadeChile', 'chile', 'Santiago'];
//fetchDataReddit(subreddits)
//  .then(data => console.log(JSON.stringify(data, null, 2)))
//  .catch(error => console.error('Error en la prueba:', error));