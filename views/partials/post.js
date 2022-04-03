const { all, getCategoryRoute, getPostRoute } = require( `../../src/utilities` );

module.exports = post => `
    <article>
        <h1><a href="${ getPostRoute( post ) }">${ post.title }</a></h1>
        <div>${ post.pubdate.getFormatted() }</div>
        <div>
            ${ post.content }
        </div>
        <h3>Categories:</h3>
        <ul>
            ${ all(
                post.categories,
                cat => `<li><a href="${ getCategoryRoute( cat ) }/">${ cat.title }</a></li>`
            )}
        </ul>
    </article>
`;