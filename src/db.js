const { Client } = require( `pg` );
const createPost = require( `./post` );

let client;

const tables = [
    {
        name: `post`,
        columns: {
            title: `text`,
            content: `text`,
            slug: `text`,
            pubdate: `timestamp`
        }
    },
    {
        name: `category`,
        columns: {
            title: `text`,
            slug: `text`
        }
    },
    {
        name: `post_category`,
        columns: {},
        references: [ `post` ]
    }
];

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
    initTables: () => Promise.all( tables.reverse().map( table => new Promise( ( resolve, reject ) => {
        client.query( `drop table if exists ${ table.name }`, ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                /*
                const columns = [ `${ table.name }_id serial primary key`].concat( Object.keys( table.columns ).map( key => `${ key } ${ table.columns[ key ] }`) );
                if ( table.references ) {
                    columns.push( `${ table.references[ 0 ] }_id int` );
                    columns.push( `constraint fk_${ table.references[ 0 ] } foreign key( ${ table.references[ 0 ] }_id ) references ${ table.references[ 0 ] }( ${ table.references[ 0 ] }_id )` );
                }
                client.query( `create table ${ table.name } ( ${ columns.join( `, ` ) } )`, ( err, res ) => {
                    if ( err ) {
                        reject( err );
                    }
                    else {
                        resolve( res );
                    }
                });
                */
               resolve( res );
            }
        });
    }))),
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