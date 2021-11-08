const loadPosts = require( `./load-posts` );
const db = require( `./db` );

db.connect();
db.clearPosts().then( () => {
	loadPosts().then( ( posts ) => {
		Promise.all( posts.map( ( post ) => db.createPost( post ) ) ).then( () => {
			db.close();
		})
	})
});