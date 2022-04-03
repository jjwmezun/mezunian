const loadPosts = require( `../src/load-posts` );
const db = require( `../src/db` );
const path = require( `path` );
const { lstat, readdir, rmdir, unlink } = require( `fs` );

require( `dotenv` ).config( { path: path.resolve( process.cwd(), '.env.admin' ) } );

db.connect();
readdir( `html`, ( err, files ) => {
	if ( err ) {
		console.log( err );
	}
	else {
		Promise.all( files.map( file => new Promise( ( resolve, reject ) => {
			file = `html/${ file }`;
			lstat( file, ( err, stats ) => {
				if ( err ) {
					reject( err );
				}
				else {
					if ( stats.isDirectory() ) {
						rmdir( file, { recursive: true, force: true }, err => {
							if ( err ) {
								reject( err );
							}
							else {
								resolve( file );
							}
						});
					}
					else {
						unlink( file, err => {
							if ( err ) {
								reject( err );
							}
							else {
								resolve( file );
							}
						});
					}
				}
			});
		}))).then( () => {
			db.clearData().then( () => {
				loadPosts().then( posts => {
					Promise.all( posts.map( post => db.createPost( post ) ) ).then( () => {
						db.getPosts().then( posts => {
							db.createHTMLForHome( posts ).then( () => {
								Promise.all( posts.map( post => db.createHTMLFromPost( post ) ) ).then( posts => {
									db.getCategories().then( cats => {
										Promise.all( cats.map( cat => db.createHTMLFromCategory( cat ) ) ).then( cats => {
											db.close();
										});
									});
								});
							});
						});
					})
				})
			});
		});
	}
});