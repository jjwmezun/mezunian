const { getDateRoute } = require( `../src/utilities` );

module.exports = ( data ) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    </head>
    <body>
    <h1><a href="/">${ data.site.title }</a></h1>
    <h2>${ data.site.tagline }</h2>
    ${
        data.posts.reduce(
            ( sum, post ) => `${ sum }
                <article>
                    <h1><a href="/${ getDateRoute( post ) }/${ post.slug }/">${ post.title }</a></h1>
                    <div>${ new Intl.DateTimeFormat( `en-US`, { year: 'numeric' } ).format( post.pubdate ) } ${ new Intl.DateTimeFormat( `en-US`, { month: 'long' } ).format( post.pubdate ) } ${ new Intl.DateTimeFormat( `en-US`, { day: 'numeric' } ).format( post.pubdate ) }</div>
                    <div>
                        ${ post.content }
                    </div>
                    <h3>Categories:</h3>
                    <ul>
                        ${
                            ( post.categories ) ?
                            post.categories.reduce(
                                ( sum, cat ) => `${ sum }<li><a href="/category/${ cat.slug }/">${ cat.title }</a></li>`,
                                ``
                            ) : ``
                        }
                    </ul>
                </article>
            `,
            ``
        )
    }
    </body>
    </html>
`;