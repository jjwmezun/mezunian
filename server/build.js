const loadPosts = require( `../src/load-posts` );
const db = require( `../src/db` );
const path = require( `path` );

require( `dotenv` ).config( { path: path.resolve( process.cwd(), '.env.admin' ) } );

db.connect();
db.clearPosts().then( () => {
	loadPosts().then( ( posts ) => {
		Promise.all( posts.map( ( post ) => db.createPost( post ) ) ).then( () => {
			db.close();
		})
	})
});