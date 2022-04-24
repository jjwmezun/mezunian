const { readdir, readFile } = require( `fs` );
const MarkdownIt = require( `markdown-it` );
const path = require( `path` );
const mtmlToHtml = require( `./mtml-to-html` );

module.exports = () => new Promise( ( resolve, reject ) => {
    readdir( `posts`, ( err, files ) => {
        if ( err ) {
            throw err;
        }

        md = new MarkdownIt();

        const promises = Promise.all( files.map( file => {
            return new Promise( function( resolve, reject ) {
                readFile( `posts/${ file }`, ( err, data ) => {
                    if ( err ) {
                        reject( err );
                    }

                    const text = data.toString();
                    const headerStart = text.indexOf( `---\n` );

                    if ( headerStart === -1 ) {
                        console.log( `Error: post “${ post }” is missing header.` );
                    }

                    const headerEnd = text.indexOf( `---\n`, headerStart + 1 );
                    if ( headerEnd === -1 ) {
                        console.log( `Error: post “${ post }”’s header is malformed.` );
                    }

                    const post = text.substr( headerStart + 4, headerEnd - 5 ).split( `\n` ).reduce( ( dict, current ) => {
                        const [ key, value ] = current.split( `:` );
                        dict[ key ] = value.trim();
                        return dict;
                    }, {} );
                    post.content = mtmlToHtml(text.substring( headerEnd + 4 ));
                    post.slug = path.parse( file ).name;
                    resolve( post );
                });
            });
        }));

        promises.then( posts => resolve( posts ) );
    });
});