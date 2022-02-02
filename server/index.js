const express = require( `express` );
const baseTemplate = require( `../views/base` );
const fs = require( `fs` );
const db = require( `../src/db` );

require( `dotenv` ).config();

const app = express();

fs.readFile( `./config.json`, ( err, data ) => {
	if ( err ) {
		throw err;
	}

	a = data.toString();
	try {
		const b = JSON.parse( a );
		data = b;
	}
	catch ( err ) {
		console.log( a );
	}

	const serverErrorPage = function( res, reason ) {
		res.status( 500 );
		res.send( reason );
	};

	app.get( `/`, ( req, res ) => {
		db.connect().then( () => {
			db.getPosts().then( ( posts ) => {
				db.close();
				data.posts = posts;
				res.status( 200 );
				res.send( baseTemplate( data ) );
			}).catch( reason => serverErrorPage( res, reason ) );
		}).catch( reason => serverErrorPage( res, reason ) );
	});

	app.get( `*`, ( req, res ) => {
		db.connect().then( () => {
			const paths = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
			const path = paths.pop();
			db.getPostBySlug( path ).then( ( posts ) => {
				db.close();
				data.posts = posts;
				res.send( baseTemplate( data ) );
			});
			//res.status( 404 );
			//res.send( `404 George` );
		}).catch( reason => serverErrorPage( res, reason ) );
	});

    const port = 3000;
    const server = app.listen( port, () => {
        console.log( `Listening on http://localhost:${port}` );
    });
	
});