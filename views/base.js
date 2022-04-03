const { all, cond, getPostRoute, getCategoryRoute } = require( `../src/utilities` );
const postTemplate = require( `./partials/post` );

module.exports = ( data ) => `
    <!DOCTYPE html>
        <html lang="en">
        <head>
        </head>
        <body>
            <header>
                <div>
                    <h1><a href="/">${ data.site.title }</a></h1>
                    <h2>${ data.site.tagline }</h2>
                </div>
                <nav>${ cond( data.menus.header && data.menus.header.length > 0, `
                    <ul>${ all( data.menus.header, link => `
                        <li>
                            <a href="${ link.route }">${ link.title }</a>
                        </li>
                    `)}</ul>
                `)}</nav>
                <form action="/" method="get">
                    <input type="text" name="s" placeholder="Search" />
                    <input type="submit" value="Search" />
                </form>
            </header>
            <main>
                ${ all( data.posts, postTemplate ) }
            </main>
            <aside>${ cond( data.site.latest && data.site.latest.length > 0, `
                <section>
                    <h3>Recent Posts</h3>
                    <ul>${ all( data.site.latest, post => `
                        <li><a href="${ getPostRoute( post ) }">${ post.title }</a></li>
                    `)}</ul>
                </section>`
                )}${ cond( data.site.archive, `
                <section>
                    <h3>Archive</h3>
                    <ul>${ all( data.site.archive, ( data, year ) => `
                        <li>
                            ${ year } ( ${ data.postCount } )
                            <ul>
                                ${ all( data.months, ( data, month ) => `
                                    <li>
                                        ${ data.monthName } ( ${ data.posts.length } )
                                        <ul>
                                            ${ all( data.posts, post => `
                                                <li><a href="${ getPostRoute( post ) }">${ post.title }</a></li>
                                            `)}
                                        </ul>
                                    </li>
                                `)}
                            </ul>
                        </li>
                    `)}</ul>
                </section>
                ${ cond( data.site.categories, `
                <section>
                    <h3>Categories</h3>
                    <ul>${ all( data.site.categories, cat => `
                        <li><a href="${ getCategoryRoute( cat ) }">${ cat.title }</a></li>
                    `)}</ul>
                </section>`)}
                ${ cond( data.site.links, `
                <section>
                    <h3>My Other Sites</h3>
                    <ul>${ all( data.site.links, link => `
                        <li><a href="${ link.href }">${ link.title }</a></li>
                    `)}</ul>
                </section>` )}`
            )}</aside>
        </body>
    </html>
`;