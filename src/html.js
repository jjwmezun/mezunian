const db = require( `./db` );
const getConfig = require( `./config` );

module.exports = {
    createHTMLFromPost: post => new Promise( ( resolve, reject ) => {
        getConfig().then( data => {
            db.createHTMLFromPost( data, post ).then( posts => {
                resolve( posts );
            }).catch( err => reject( err ) );
        });
    }),
    createHTMLFromCategory: function( cat ) {
        return new Promise( ( resolve, reject ) => {
            getConfig().then( data => {
                db.createHTMLFromCategory( data, cat ).then( cats => {
                    resolve( cats );
                }).catch( err => reject( err ) );
            });
        });
    },
    createHTMLForHome: posts => new Promise( ( resolve, reject ) => {
        getConfig().then( data => {
            db.createHTMLForHome( data, posts ).then( posts => {
                resolve( posts );
            }).catch( err => reject( err ) );
        });
    })
}