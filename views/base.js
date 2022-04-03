const { all, cond } = require( `../src/utilities` );
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
            ${ all( data.posts, postTemplate ) }
        </body>
    </html>
`;