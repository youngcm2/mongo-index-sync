const _ = require('underscore');
const async = require('async');

const IGNORE_INDEX_PROPS = [
    'key',
    'v',
    'ns'
];

const collect = async (db) => {
    const collections = await db.getCollectionNames();

    let indexesByCollection = await async.reduce(collections, {}, async (memo, item) => {

        if (item === 'system.indexes') {
            return;
        }

        // not sure if collection.collectionName is guaranteed, but it works for now.
        memo[item] = [];

        let indexes = await db[item].getIndexes();

        indexes.forEach(index => {
            // Ignore the built-in `_id_` primary key index.
            if (index.name !== '_id_') {
                memo[item].push({
                    fields: index.key,
                    options: _.omit(index, IGNORE_INDEX_PROPS)
                });
            }
        });
        return memo;
    });

    return indexesByCollection;
};

module.exports = collect;