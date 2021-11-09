const { Client } = require( `pg` );
const createPost = require( `./post` );

let client;

module.exports = {
    connect: () => {
        client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD
        });
        return client.connect();
    },
    close: () => {
        client.end();
    },
    clearPosts: () => new Promise( ( resolve, reject ) => {
        client.query( `truncate post`, ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res );
            }
        });
    }),
    createPost: ( post ) => new Promise( ( resolve, reject ) => {
        const pubDate = new Date( post.date );
        client.query( `insert into post (title, content, pubdate, slug) VALUES ( $1, $2, $3, $4 )`, [ post.title, post.content, pubDate, post.slug ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res );
            }
        });
    }),
    getPosts: () => new Promise( ( resolve, reject ) => {
        client.query( `select * from post`, ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res.rows );
            }
        });
    }),
    getPostBySlug: ( slug ) => new Promise( ( resolve, reject ) => {
        client.query( `select * from post where slug = $1`, [ slug ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res.rows );
            }
        });
    })
};