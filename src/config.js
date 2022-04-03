const { readFile } = require( `fs` );
const { getPosts, getCategories } = require( `./db` );

const defaultNumberOfLatestPosts = 5;

module.exports = () => new Promise( ( resolve, reject ) => {
    readFile( `./config.json`, ( err, data ) => {
        if ( err ) {
            reject( err );
        }
        else {
            const text = data.toString();
            try {
                const obj = JSON.parse( text );
                getPosts().then( posts => {
                    getCategories().then( cats => {
                        obj.site.categories = cats;
                        obj.site.latest = posts.slice( 0, obj.options && obj.options.numberOfLatestPosts ? obj.options.numberOfLatestPosts : defaultNumberOfLatestPosts );
                        obj.site.archive = {};
                        posts.forEach( post => {
                            const year = post.pubdate.getYear();
                            if ( !( year in obj.site.archive ) ) {
                                obj.site.archive[ year ] = {
                                    months: {},
                                    postCount: 0
                                };
                            }
                            const month = post.pubdate.getMonth();
                            if ( !( month in obj.site.archive[ year ].months ) ) {
                                obj.site.archive[ year ].months[ month ] = {
                                    monthName: post.pubdate.getMonthName(),
                                    posts: []
                                };
                            }
                            obj.site.archive[ year ].months[ month ].posts.push( post );
                            obj.site.archive[ year ].postCount++;
                        });
                        resolve( obj );
                    }).catch( err => reject( err ) );
                }).catch( err => reject( err ) );
            }
            catch ( err ) {
                reject( err );
            }
        }
    }); 
});