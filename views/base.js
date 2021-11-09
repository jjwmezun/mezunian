module.exports = ( data ) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    </head>
    <body>
    <h1>${ data.site.title }</h1>
    <h2>${ data.site.tagline }</h2>
    ${
        data.posts.reduce(
            ( sum, post ) => `${ sum }
                <article>
                    <h1>${ post.title }</h1>
                    <div>
                        ${ post.content }
                    </div>
                </article>
            `,
            ``
        )
    }
    </body>
    </html>
`;