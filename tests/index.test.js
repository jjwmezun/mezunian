const db = require( `../src/db` );
require( `dotenv` ).config();

test( `Non-admin db user can’t do mo’ than select from db`, () => {
    db.connect();
    return expect( db.createPost({ title: `Cringe`, content: `Ima gonna hack in some cringe & embarrass Mezun.` }).catch( ( err ) => {
        db.close();
        throw `error`;
    })).rejects.toMatch( `error` );
    
});