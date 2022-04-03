const { readFile } = require( `fs` );

module.exports = {
    slugify: text => text.replace( /[\s_]/g, `-` ).replace( /[^a-zA-Z0-9-]/g, `` ).toLowerCase(),
    getConfig: () => new Promise( ( resolve, reject ) => {
        readFile( `./config.json`, ( err, data ) => {
            if ( err ) {
                reject( err );
            }
            else {
                const text = data.toString();
                try {
                    resolve( JSON.parse( text ) );
                }
                catch ( err ) {
                    reject( err );
                }
            }
        }); 
    }),
    getDateRoute: post => `${ post.pubdate.getFullYear() }/${ post.pubdate.getMonth() }/${ String( post.pubdate.getDate() ).padStart( 2, `0` ) }`,
    all: ( list, f ) => list.map( f ).join( `` ),
    cond: ( condition, mainOut, otherOut ) => condition ? mainOut : ( otherOut === undefined ) ? `` : otherOut
};