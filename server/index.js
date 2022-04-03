const express = require( `express` );
const { readFile } = require( `fs` );
const db = require( `../src/db` );
const { getConfig } = require( `../src/utilities` );
const baseTemplate = require( `../views/base`);

require( `dotenv` ).config();

const app = express();

const serverErrorPage = function( res, reason ) {
	res.status( 500 );
	res.send( reason );
};

app.get( `/`, ( req, res ) => {
	if ( req && req.query && req.query.s ) {
		db.connect();
		db.searchPosts( req.query.s ).then( posts => {
			getConfig().then( data => {
				data.posts = posts;
				console.log( data );
				res.send( baseTemplate( data ) );
				db.close();
			});
		});
	}
	else {
		readFile( `html/index.html`, ( err, data ) => {
			if ( err ) {
				serverErrorPage( res, err );
			}
			else if ( data === undefined ) {
				res.status( 404 );
				res.send( `404 George` );
			}
			else {
				res.send( data.toString() );
			}
		});
	}
});

app.get( `/category/*`, ( req, res ) => {
	const paths = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
	const path = paths.pop();
	readFile( `html/category/${ path }.html`, ( err, data ) => {
		if ( err || data === undefined ) {
			res.status( 404 );
			res.send( `404 George` );
		}
		else {
			res.send( data.toString() );
		}
	});
});

app.get( `*`, ( req, res ) => {
	const paths = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
	const path = paths.pop();
	readFile( `html/post/${ path }.html`, ( err, data ) => {
		if ( err || data === undefined ) {
			res.status( 404 );
			res.send( `404 George` );
		}
		else {
			res.send( data.toString() );
		}
	});
});

const port = 3000;
const server = app.listen( port, () => {
	console.log( `Listening on http://localhost:${port}` );
});