module.exports = {
    slugify: text => text.replace( /[\s_]/g, `-` ).replace( /[^a-zA-Z0-9-]/g, `` ).toLowerCase()
};