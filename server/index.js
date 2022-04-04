const express = require( `express` );
const { readFile } = require( `fs` );
const db = require( `../src/db` );
const getConfig = require( `../src/config` );
const baseTemplate = require( `../views/base`);
const path = require( `path` );

const validAssetTypes = {
	"css": {
		"contentType": "text/css"
	},
	"js": {
		"contentType": "application/javascript"
	},
	"jpg": {
		"contentType": "image/jpeg"
	},
	"png": {
		"contentType": "image/png"
	},
	"gif": {
		"contentType": "image/gif"
	},
	"flac": {
		"contentType": "audio/x-flac"
	}
};

require( `dotenv` ).config();

const app = express();

const serverErrorPage = function( res, reason ) {
	res.status( 500 );
	res.send( `Website Error :(` );
};

const notFoundErrorPage = function( res ) {
	res.status( 404 );
	res.send( `404 George` );
};

app.get( `/assets/*`, ( req, res ) => {
	const locals = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
	const local = locals.slice( 1 ).join( `/` );
	const ext = path.extname( `assets/${ local }` ).replace( /^\./, `` );
	readFile( `assets/${ local }`, ( err, data ) => {
		if ( err || data === undefined || !( ext in validAssetTypes ) ) {
			notFoundErrorPage( res );
		}
		else {
			const assetHeaders = validAssetTypes[ ext ];
			if ( `contentType` in assetHeaders ) {
				res.contentType( assetHeaders.contentType );
			}
			res.send( data );
		}
	});
});

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
				notFoundErrorPage( res );
			}
			else {
				res.send( data.toString() );
			}
		});
	}
});

app.get( `/category/*`, ( req, res ) => {
	const locals = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
	const local = locals.pop();
	readFile( `html/category/${ local }.html`, ( err, data ) => {
		if ( err || data === undefined ) {
			notFoundErrorPage( res );
		}
		else {
			res.send( data.toString() );
		}
	});
});

app.get( `*`, ( req, res ) => {
	const locals = req.path.replace( /^\//, `` ).replace( /\/$/, `` ).split( `/` );
	const local = locals.pop();
	readFile( `html/post/${ local }.html`, ( err, data ) => {
		if ( err || data === undefined ) {
			notFoundErrorPage( res );
		}
		else {
			res.send( data.toString() );
		}
	});
});

app.use( ( err, req, res, next ) => {
    console.error( err );
    serverErrorPage( res, err );
});

const port = 3000;
const server = app.listen( port, () => {
	console.log( `Listening on http://localhost:${port}` );
});