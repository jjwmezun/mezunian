const createDate = raw => {
    return {
        getYear: () => raw.getFullYear(),
        getMonth: () => raw.getMonth() + 1,
        getMonthName: () => new Intl.DateTimeFormat( `en-US`, { month: 'long' } ).format( raw ),
        getDate: () => String( raw.getDate() ).padStart( 2, `0` ),
        getFormatted: () => `${ new Intl.DateTimeFormat( `en-US`, { year: 'numeric' } ).format( raw ) } ${ new Intl.DateTimeFormat( `en-US`, { month: 'long' } ).format( raw ) } ${ new Intl.DateTimeFormat( `en-US`, { day: 'numeric' } ).format( raw ) }`
    };
};

module.exports = data => {
    return {
        title: data.title,
        slug: data.slug,
        content: data.content,
        pubdate: createDate( new Date( data.pubdate ) ),
        categories: data.categories
    };
};