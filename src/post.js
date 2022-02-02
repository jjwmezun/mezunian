module.exports = ( data ) => {
    return {
        title: data.title,
        slug: data.slug,
        content: data.content,
        pubdate: new Date( data.pubdate ),
        categories: []
    };
};