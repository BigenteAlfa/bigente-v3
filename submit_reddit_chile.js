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
    let nuevosPosts = 0;
    let postsEditados = 0;

    try {
        await Promise.all(posts.map(async (post) => {
            const { id, title, subreddit, selftext, thumbnail, score, url, time_created } = post;
            const query = `
                INSERT INTO db_reddit_chile (id, title, subreddit, selftext, thumbnail, score, url, time_created)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE
                SET score = EXCLUDED.score, time_edited = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '-03'
                RETURNING time_edited; -- Retorna el valor de time_edited después de la actualización
            `;
            const values = [id, title, subreddit, selftext, thumbnail, score, url, time_created];
            const result = await client.query(query, values);

            if (result.rowCount === 1 && result.rows[0].time_edited) {
                postsEditados++;
            } else {
                nuevosPosts++;
            }
        }));

        console.log(`Posts de Reddit insertados correctamente. Nuevos: ${nuevosPosts}, Editados: ${postsEditados}`);
    } catch (error) {
        console.error('Error al insertar datos de Reddit:', error);
    } finally {
        client.release();
    }
}

// Función principal que será invocada
/*async function submitRedditChile() {
    try {
        // Obtener datos de Reddit
        const subreddits = ['chile', 'RepublicadeChile', 'Santiago', 'ChileIT', 'Chilefit'];
        const redditPosts = await fetchDataReddit(subreddits);

        // Insertar los datos en la base de datos
        await insertarDatosReddit(redditPosts);

        console.log('Proceso completado exitosamente');
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
        const { nuevosPosts, postsEditados } = await insertarDatosReddit(redditPosts);

        res.status(200).send(`Proceso completado exitosamente. Nuevos Posts: ${nuevosPosts}, Editados: ${postsEditados}`);
    } catch (error) {
        console.error('Error en el proceso:', error);
        res.status(500).send('Error en el proceso');
    }
};

// Llama a la función principal para iniciar el proceso
submitRedditChile();