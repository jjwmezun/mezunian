const { Client } = require( `pg` );
const { slugify } = require( `./utilities` );
const baseTemplate = require( `../views/base` );
const { existsSync, mkdirSync, writeFile } = require( `fs` );
const createPost = require( `./post` );

let client;

const tables = Object.freeze([
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
        references: [ `post`, `category` ]
    },
    {
        name: `html`,
        columns: {
            route: `text`,
            content: `text`,
            text: `text`
        }
    }
]);


const insertCategory = ( postId, catId, resolve, reject ) => client.query( `insert into post_category (post_id, category_id) VALUES ( $1, $2 )`, [ postId, catId ], ( err, res ) => {
    if ( err ) {
        reject( err );
    }
    else {
        resolve( res );
    }
});

const getPostData = posts => Promise.all( posts.map( post => new Promise( ( resolve, reject ) => {
    client.query( `select * from post_category where post_id = $1`, [ post.post_id ], ( err, res ) => {
        if ( err ) {
            reject( err );
        }
        else {
            post.categories = [];
            Promise.all( res.rows.map( cat => new Promise( ( resolveB, rejectB ) => {
                client.query( `select * from category where category_id = $1`, [ cat.category_id ], ( err, res ) => {
                    if ( err ) {
                        rejectB( err );
                    }
                    else {
                        if ( res.rows.length > 0 ) {
                            post.categories.push( res.rows[ 0 ] );
                        }
                        resolveB();
                    }
                });
            }))).catch( reason => console.log( reason ) ).then( () => resolve( res.rows.map( createPost ) ) );
        }
    });
})));

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
    clearTables: () => Promise.all( tables.map( table => new Promise( ( resolve, reject ) => {
        client.query( `drop table if exists ${ table.name } cascade`, ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res );
            }
        });
    }))).catch( reason => { throw reason; } ),
    initTables: () => new Promise( async ( masterResolve, masterReject ) => {
        for ( const table of tables ) {
            const columns = [ `${ table.name }_id serial primary key` ].concat( Object.keys( table.columns ).map( key => `${ key } ${ table.columns[ key ] }`) );
            if ( table.references ) {
                for ( const ref of table.references ) {
                    columns.push( `${ ref }_id int` );
                    columns.push( `constraint fk_${ ref } foreign key( ${ ref }_id ) references ${ ref }( ${ ref }_id )` );
                }
            }
            await new Promise( ( resolve, reject ) => client.query( `create table ${ table.name } ( ${ columns.join( `, ` ) } )`, ( err, res ) => {
                if ( err ) {
                    reject( err );
                }
                else {
                    resolve( res );
                }
            })).catch( reason => masterReject( reason ) );
            await new Promise( ( resolve, reject ) => client.query( `grant select on ${ table.name } to mezunian`, ( err, res ) => {
                if ( err ) {
                    reject( err );
                }
                else {
                    resolve( res );
                }
            })).catch( reason => masterReject( reason ) );
        };
        masterResolve();
    }).catch( reason => { throw reason; } ),
    clearData: () => new Promise( async ( masterResolve, masterReject ) => {
        for ( const table of tables ) {
            await new Promise( ( resolve, reject ) => client.query( `truncate ${ table.name } cascade`, ( err, res ) => {
                if ( err ) {
                    reject( err );
                }
                else {
                    resolve( res );
                }
            })).catch( reason => masterReject( reason ) );
        };
        masterResolve();
    }),
    createPost: post => new Promise( ( resolve, reject ) => {
        const pubDate = new Date( post.date );

        // Generate categories from post meta.
        if ( post.categories ) {
            const cats = [];
            let state = ``;
            let current = ``;
            for ( const letter of post.categories ) {
                if ( letter === `,` && state === `` ) {
                    cats.push( current.trim() );
                    current = ``;
                }
                else if ( letter === `"` || letter === `'` ) {
                    if ( state === letter ) {
                        state = ``;
                    }
                    else if ( state === `` ) {
                        state = letter;
                    }
                    else {
                        current += letter;
                    }
                }
                else {
                    current += letter;
                }
            }
            if ( current !== `` ) {
                cats.push( current.trim() );
            }
            post.categories = cats;
        }

        client.query( `insert into post (title, content, pubdate, slug) VALUES ( $1, $2, $3, $4 ) returning post_id`, [ post.title, post.content, pubDate, post.slug ], async ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                const postId = res.rows[ 0 ].post_id;
                if ( post.categories ) {
                    for ( const cat of post.categories ) {
                        await new Promise( ( resolve, reject ) => client.query( `select category_id from category where title = $1`, [ cat ], ( err, res ) => {
                            if ( err ) {
                                reject( err );
                            }
                            else {
                                if ( res.rows.length <= 0 ) {
                                    client.query( `insert into category (title, slug) VALUES ( $1, $2 ) returning category_id`, [ cat, slugify( cat ) ], ( err, res ) => {
                                        if ( err ) {
                                            reject( err );
                                        }
                                        else {
                                            const catId = res.rows[ 0 ][ `category_id` ];
                                            insertCategory( postId, catId, resolve, reject );
                                        }
                                    });
                                }
                                else {
                                    const catId = res.rows[ 0 ][ `category_id` ];
                                    insertCategory( postId, catId, resolve, reject );
                                    resolve( res );
                                }
                            }
                        }));
                    }
                }
                resolve( res );
            }
        });
    }),
    getPosts: () => new Promise( ( resolve, reject ) => {
        client.query( `select * from post`, async ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                getPostData( res.rows ).catch( reason => console.log( reason ) ).then( () => resolve( res.rows.map( createPost ) ) );
            }
        });
    }),
    getPostBySlug: slug => new Promise( ( resolve, reject ) => {
        client.query( `select * from post where slug = $1`, [ slug ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                getPostData( res.rows ).catch( reason => console.log( reason ) ).then( () => resolve( res.rows.map( createPost ) ) );
            }
        });
    }),
    getCategories: () => new Promise( ( resolve, reject ) => {
        client.query( `select * from category`, async ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res.rows );
            }
        });
    }),
    getCategoryBySlug: slug => new Promise( ( resolve, reject ) => {
        client.query( `select * from category where slug = $1`, [ slug ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res.rows );
            }
        });
    }),
    getPostsByCategory: cat => new Promise( ( resolve, reject ) => {
        client.query( `select * from post_category where category_id = $1`, [ cat.category_id ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                const postIds = res.rows.map( i => i.post_id );
                Promise.all( postIds.map( i => new Promise( ( err, res ) => {
                    client.query( `select * from post where post_id = $1`, [ i ], ( err, res ) => {
                        if ( err ) {
                            reject( err );
                        }
                        else {
                            getPostData( res.rows ).catch( reason => console.log( reason ) ).then( () => resolve( res.rows.map( createPost ) ) );
                        }
                    });
                }))).then( res => resolve( [].concat.apply( [], res ) ) );
            }
        });
    }),
    getHTMLByRoute: route => new Promise( ( resolve, reject ) => {
        client.query( `select * from html where route = $1`, [ route ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                resolve( res );
            }

        });
    }),
    createHTMLFromPost: ( data, post ) => new Promise( ( resolve, reject ) => {
        data.posts = [ post ];
        const content = baseTemplate( data );
        client.query( `insert into html (route, content, text) VALUES ( $1, $2, $3 )`, [ post.slug, content, post.content ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                if ( !existsSync( `html/post` ) )
                {
                    mkdirSync(`html/post` );
                }
                
                writeFile( `html/post/${ post.slug }.html`, content, err => {
                    if ( err ) {
                        reject( err );
                    }
                });
                resolve( res );
            }
        });
    }),
    createHTMLFromCategory: function( data, cat ) {
        return new Promise( ( resolve, reject ) => {
            this.getPostsByCategory( cat ).then( posts => {
                data.posts = posts;
                const content = baseTemplate( data );
                client.query( `insert into html (route, content, text) VALUES ( $1, $2, $3 )`, [ cat.slug, content, `` ], ( err, res ) => {
                    if ( err ) {
                        reject( err );
                    }
                    else {
                        if ( !existsSync( `html/category` ) )
                        {
                            mkdirSync(`html/category` );
                        }
                        
                        writeFile( `html/category/${ cat.slug }.html`, content, err => {
                            if ( err ) {
                                reject( err );
                            }
                        });
                        resolve( res );
                    }
                });
            });
        });
    },
    createHTMLForHome: ( data, posts ) => new Promise( ( resolve, reject ) => {
        data.posts = posts;
        const content = baseTemplate( data );
        client.query( `insert into html (route, content, text) VALUES ( $1, $2, $3 )`, [ `index`, content, `` ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                writeFile( `html/index.html`, content, err => {
                    if ( err ) {
                        reject( err );
                    }
                });
                resolve( res );
            }
        });
    }),
    searchPosts: query => new Promise( ( resolve, reject ) => {
        client.query( `select * from post where lower(content) like lower($1) or lower(title) like lower($1)`, [ `%${ query }%` ], ( err, res ) => {
            if ( err ) {
                reject( err );
            }
            else {
                getPostData( res.rows ).catch( reason => console.log( reason ) ).then( () => resolve( res.rows ) );
            }
        });
    })
};