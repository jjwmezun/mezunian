const { fstat } = require("fs");
const path = require( `path` );
const db = require( `../src/db` );
require( `dotenv` ).config( { path: path.resolve( process.cwd(), '.env.admin' ) } );

test( `Admin db user can do mo’ than select from db`, () => {
    db.connect();
    return db.createPost({ title: `Cringe`, content: `Ima gonna hack in some cringe & embarrass Mezun.`, date: `2021-11-07` }).then( () => {
    }).finally( () => {
        db.close();
    });
});