const { Client } = require( `pg` );

let client;

module.exports = {
    connect: () => {
        client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD
        });
        client.connect();
    },
    close: () => {
        client.end();
    },
    clearPosts: () => new Promise( ( resolve, reject ) => {
        client.query( `truncate post`, ( err, res ) => {
            if ( err ) {
                throw err;
            }
            resolve( res );
        });
    }),
    createPost: ( post ) => new Promise( ( resolve, reject ) => {
        client.query( `insert into post (title, content) VALUES ( $1, $2 )`, [ post.title, post.content ], ( err, res ) => {
            if ( err ) {
                throw err;
            }
            console.log( `¡“${ post.title }” successfully created!` );
            resolve( res );
        });
    }),
    getPosts: () => new Promise( ( resolve, reject ) => {
        client.query( `select * from post`, ( err, res ) => {
            if ( err ) {
                throw err;
            }
            resolve( res.rows );
        });
    })
};