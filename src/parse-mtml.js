const { isStringEmpty } = require( `./utilities` );

const ScannerState = {
    Body: 0,
    Head: 1,
    Tail: 2,
    AttHead: 3,
    AttBody: 4
};

const autoSelfCloseTags = [
    `br`,
    `source`
];

module.exports = ( text ) => {
    let state = ScannerState.Body;
    const data = { tag: `root`, atts: {}, content: [], parent: null };
    let currentTag = data;
    let i = 0;
    let attHead = ``;
    let attBody = ``;
    let content = ``;
    let tail = ``;
    while ( i < text.length ) {
        const char = text[ i ];
        switch ( state ) {
            case ( ScannerState.Body ): {
                if ( char === `<` ) {
                    if ( !isStringEmpty( content ) ) {
                        currentTag.content.push( content );
                    }
                    content = ``;

                    if ( text[ i + 1 ] === `/` ) {
                        ++i; // Consume “/”.
                        state = ScannerState.Tail;
                    }
                    else {
                        state = ScannerState.Head;
                        const newTag = { tag: ``, atts: {}, content: [], parent: currentTag };
                        currentTag.content.push( newTag );
                        currentTag = newTag;
                    }
                }
                else {
                    content += char;
                }
            }
            break;
            case ( ScannerState.Head ): {
                if ( `${ char }${ text[ i + 1 ] }` === `/>` ) {
                    i++; // Consume “>”.
                    currentTag = currentTag.parent;
                    state = ScannerState.Body;
                }
                else if ( char === `>` ) {
                    if ( autoSelfCloseTags.includes( currentTag.tag ) ) {
                        currentTag = currentTag.parent; // If tag closing, exit out to parent tag.
                    }
                    state = ScannerState.Body;
                }
                else if ( /\s/g.test( char ) ) {
                    state = ScannerState.AttHead;
                }
                else {
                    currentTag.tag += char;
                }
            }
            break;
            case ( ScannerState.Tail ): {
                if ( char === `>` ) {
                    if ( currentTag.tag !== tail ) {
                        throw `Closing different tag! Current tag: ${ currentTag.tag }, but closing: ${ tail }!`;
                    }
                    tail = ``;
                    currentTag = currentTag.parent; // Exit back out to parent tag.
                    state = ScannerState.Body;
                }
                else {
                    tail += char;
                }
            }
            break;
            case ( ScannerState.AttHead ): {
                if ( `${ char }${ text[ i + 1 ] }` === `/>` ) {
                    i++; // Consume “>”.
                    currentTag = currentTag.parent; // Exit back out to parent tag.

                    // If att head isn’t empty, then we have an att set without value, so set to true.
                    if ( !isStringEmpty( attHead ) ) {
                        currentTag.atts[ attHead.trim() ] = true;
                    }

                    attHead = ``;
                    state = ScannerState.Body;
                }
                else if ( char === `>` ) {
                    if ( autoSelfCloseTags.includes( currentTag.tag ) ) {
                        currentTag = currentTag.parent; // If tag closing, exit out to parent tag.
                    }

                    // If att head isn’t empty, then we have an att set without value, so set to true.
                    if ( !isStringEmpty( attHead ) ) {
                        currentTag.atts[ attHead.trim() ] = true;
                    }
                    
                    attHead = ``;
                    state = ScannerState.Body;
                }
                else if ( char === `=` ) {
                    // Skip o’er quotation mark.
                    if ( text[ i + 1 ] === `"` ) {
                        ++i;
                    }
                    state = ScannerState.AttBody;
                }
                else {
                    attHead += char;
                }
            }
            break;
            case ( ScannerState.AttBody ): {
                if ( char === `"` ) {
                    currentTag.atts[ attHead.trim() ] = attBody;
                    attHead = attBody = ``;
                    state = ScannerState.AttHead;
                }
                else {
                    attBody += char;
                }
            }
            break;
        }
        ++i;
    }

    if ( state === ScannerState.Body && !isStringEmpty( content ) ) {
        if ( typeof currentTag.content === `string` ) {
            currentTag.content += content;
        }
        else {
            currentTag.content.push( content );
        }
    }

    return data;
};