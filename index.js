const fetchDataReddit = require('./fetchDataReddit');
const { Pool } = require('pg');

// Creamos instancia de Pool usando la cadena de conexión a la base de datos ElephantSQL
const pool = new Pool({
    connectionString: 'postgres://wqjfzrfu:050l8qzRWMEkR10dI7CNfddmnZUJS0Tp@silly.db.elephantsql.com/wqjfzrfu',
    ssl: {
      rejectUnauthorized: false 
    }
});

// Función para insertar datos de Reddit en la base de datos
async function insertarDatosReddit(posts) {
    const client = await pool.connect();

    try {
        await Promise.all(posts.map(async (post) => {
            const { id, title, subreddit, selftext, thumbnail, score, url, time_created } = post;
            const query = `
                INSERT INTO db_reddit_chile (id, title, subreddit, selftext, thumbnail, score, url, time_created)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE
                SET score = EXCLUDED.score, time_edited = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '-03'
                RETURNING time_edited;
            `;
            const values = [id, title, subreddit, selftext, thumbnail, score, url, time_created];
            await client.query(query, values);
        }));

        console.log(`Posts de Reddit insertados correctamente.`);
    } catch (error) {
        console.error('Error al insertar datos de Reddit:', error);
    } finally {
        client.release();
    }
}

/*
// Función principal que será invocada
async function submitRedditChile() {
    try {
        // Obtener datos de Reddit
        const subreddits = ['chile', 'RepublicadeChile', 'Santiago', 'ChileIT', 'Chilefit'];
        const redditPosts = await fetchDataReddit(subreddits);

        // Insertar los datos en la base de datos
        await insertarDatosReddit(redditPosts);

        console.log('Proceso completado exitosamentee');
    } catch (error) {
        console.error('Error en el proceso:', error);
    }
}
*/

exports.submitRedditChile = async (req, res) => {
    try {
        // Obtener datos de Reddit
        const subreddits = ['chile', 'RepublicadeChile', 'Santiago', 'ChileIT', 'Chilefit'];
        const redditPosts = await fetchDataReddit(subreddits);

        // Insertar los datos en la base de datos
        await insertarDatosReddit(redditPosts);
        console.log('Corrrreeeeectisimo');
        res.status(200).send('Correcto');
    } catch (error) {
        console.error('Error en el proceso:', error);
        res.status(500).send('Error en el proceso');
    }
};


// Llama a la función principal para iniciar el proceso
//submitRedditChile();