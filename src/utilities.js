const isStringEmpty = ( text ) => /^\s*$/g.test( text );

module.exports = {
    slugify: text => text.replace( /[\s_]/g, `-` ).replace( /[^a-zA-Z0-9-]/g, `` ).toLowerCase(),
    getPostRoute: post => `/${ post.pubdate.getYear() }/${ post.pubdate.getMonth() }/${ post.pubdate.getDate() }/${ post.slug }/`,
    getCategoryRoute: cat => `/category/${ cat.slug }`,
    all: ( list, f ) => ( Array.isArray( list ) ? list.map( f ) : Object.keys( list ).map( key => f( list[ key ], key ) ) ).join( `` ),
    cond: ( condition, mainOut, otherOut ) => condition ? mainOut : ( otherOut === undefined ) ? `` : otherOut,
    isStringEmpty: isStringEmpty,
    trim: function( content, trim ) {
        const list = content.split( trim );
        while ( isStringEmpty( list[ 0 ] ) && list.length > 0 ) {
            list.shift();
        }
        let i = list.length - 1;
        while ( isStringEmpty( list[ i ] ) && i > 0 ) {
            list.pop();
            --i;
        }
        return list.join( trim );
    }
};