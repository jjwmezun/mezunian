const parse = require( `./parse-mtml` );
const { isStringEmpty, trim } = require( `./utilities` );

const tagsWithoutParagraphs = [
    `b`,
    `strong`,
    `i`,
    `em`,
    `span`,
    `code`
];

const tagTransformations = {
    haiku: ( tag ) => {
        tag.tag = `div`;
        tag.atts = { class: `mezun-haiku` };
        const newContent = [];
        tag.content.forEach( ( content ) => {
            if ( typeof content === `string` ) {
                const stanzas = trim( content, `\n` ).split( /[\n]{2,}/g );
                stanzas.forEach( stanza => {
                    const el = {
                        tag: `stanza`,
                        atts: {},
                        parent: tag
                    };
                    el.content = trim( stanza, `\n` ).split( /\n+/g ).map( line => {
                        return {
                            tag: `line`,
                            atts: {},
                            content: line.replace( /\s/g, `&nbsp;` ),
                            parent: el
                        };
                    });
                    newContent.push( el );
                });
            }
            else {
                newContent.push( content );
            }
        });
        tag.content = newContent;
        return tag;
    },
    stanza: ( tag ) => {
        tag.tag = `div`;
        tag.atts = { class: `mezun-stanza` };
        return tag;
    },
    line: ( tag ) => {
        tag.tag = `div`;
        tag.atts = { class: `mezun-ln` };
        return tag;
    },
    music: ( tag ) => {
        if ( !( `src` in tag.atts ) ) {
            return null;
        }
        const src = tag.atts[ `src` ];
        const newTag = parse( `
            <figure class="mezun-music">
                <figcaption><b>Accompanying music:</b></figcaption>
                <audio controls>
                    <source src="/assets/music/${src}.ogg" type="audio/ogg">
                    <source src="/assets/music/${src}.mp3" type="audio/mpeg">
                    Your browser does not support the <code>audio</code> element.
                </audio>
            </figure>
        `.replace( /\n/g, `` ).replace( /[\s]{2,}/g, `` ) ).content[ 0 ];
        newTag.parent = tag.parent;
        return newTag;
    }
};

// If content is just whitespace, don’t add paragraphs.
const getContent = ( content ) => ( !isStringEmpty( content ) )
    ? `<p>${ content.trim().replace( /\n\n/g, `</p><p>` ).replace( /\n/g, `<br>` ) }</p>`
    : ``;

const renderTag = ( tag ) => {
    if ( typeof tag !== `object` || tag === null ) {
        return ``;
    }
    let text = ``;
    // Render tag head.
    if ( tag.tag !== `root` ) {
        text += `<${ tag.tag }`;
        // Render tag attributes.
        for ( const key in tag.atts ) {
            // If true, just render attribute key without value.
            if ( tag.atts[ key ] === true ) {
                text += ` ${ key }`;
            }
            else {
                text += ` ${ key }="${ tag.atts[ key ] }"`;
            }
        }
        text += `>`;
    }
    // Recursively render content.
    switch ( typeof tag.content ) {
        case ( `object` ): {
            tag.content.forEach( ( content ) => {
                if ( typeof content === `string` ) {
                    //text += ( tagsWithoutParagraphs.includes( tag.tag ) ) ? content : getContent( content );
                    text += content;
                }
                else { // Is tag.
                    text += renderTag( content );
                }
            });
        }
        break;
        case ( `string` ): {
            //text += ( tagsWithoutParagraphs.includes( tag.tag ) ) ? tag.content : getContent( tag.content );
            text += tag.content;
        }
        break;
    }
    // Render tag tail.
    if ( tag.tag !== `root` ) {
        text += `</${ tag.tag }>`;
    }
    return text;
};

const mtmlToHtml = ( tag ) => {
    // Apply transformation for custom MTML tags to HTML.
    if ( tag.tag in tagTransformations ) {
        tag = tagTransformations[ tag.tag ]( tag );
    }
    // Recursively convert children.
    if ( typeof tag === `object` && tag !== null && `content` in tag && typeof tag.content === `object` ) {
        for ( let i = 0; i < tag.content.length; ++i ) {
            tag.content[ i ] = mtmlToHtml( tag.content[ i ] );
        }
    }
    return tag;
};

module.exports = ( text ) => renderTag( mtmlToHtml( parse( text ) ) );