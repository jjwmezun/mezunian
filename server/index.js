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

	app.get( `/`, ( req, res ) => {
		a = data.toString();
		try {
			const b = JSON.parse( a );
			data = b;
		}
		catch ( err ) {
			console.log( a );
		}
		console.log( data );
		db.connect();
		db.getPosts().then( ( posts ) => {
			db.close();
			data.posts = posts;
			console.log( data );
			res.send( baseTemplate( data ) );
		})
    });

    app.get( `*`, ( req, res ) => {
        res.status( 404 );
        res.send( `404 George` );
    });

    const port = 3000;
    const server = app.listen( port, () => {
        console.log( `Listening on http://localhost:${port}` );
    });
});