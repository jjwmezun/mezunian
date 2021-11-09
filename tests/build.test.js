const { fstat } = require("fs");
const path = require( `path` );
const db = require( `../src/db` );
require( `dotenv` ).config( { path: path.resolve( process.cwd(), '.env.admin' ) } );

test( `Admin db user can do mo’ than select from db`, () => {
    db.connect();
    return db.createPost({ title: `Cringe`, content: `Ima gonna hack in some cringe & embarrass Mezun.` }).then( () => {
    }).finally( () => {
        db.close();
    });
});