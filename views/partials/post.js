const { all, getDateRoute } = require( `../../src/utilities` );

module.exports = post => `
    <article>
        <h1><a href="/${ getDateRoute( post ) }/${ post.slug }/">${ post.title }</a></h1>
        <div>${ new Intl.DateTimeFormat( `en-US`, { year: 'numeric' } ).format( post.pubdate ) } ${ new Intl.DateTimeFormat( `en-US`, { month: 'long' } ).format( post.pubdate ) } ${ new Intl.DateTimeFormat( `en-US`, { day: 'numeric' } ).format( post.pubdate ) }</div>
        <div>
            ${ post.content }
        </div>
        <h3>Categories:</h3>
        <ul>
            ${ all(
                post.categories,
                cat => `<li><a href="/category/${ cat.slug }/">${ cat.title }</a></li>`
            )}
        </ul>
    </article>
`;