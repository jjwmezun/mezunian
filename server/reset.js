const db = require( `../src/db` );
const path = require( `path` );

require( `dotenv` ).config( { path: path.resolve( process.cwd(), '.env.admin' ) } );

db.connect();
db.clearTables().then( () => {
    db.initTables().then( () => db.close() );
});