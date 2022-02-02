const { slugify } = require( `../src/utilities.js` );

test( `Slugify utility replaces spaces with hyphens & makes everything lowercase`, () => {
    expect( slugify( `Hacky Sack` ) ).toEqual( `hacky-sack` );
});
test( `Slugify utility removes punctuation`, () => {
    expect( slugify( `¡“Are you a lonely 1”?` ) ).toEqual( `are-you-a-lonely-1` );
});