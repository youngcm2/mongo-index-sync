module.exports = {
    createIndex: async (db, index, collection) => {
        return await db[collection].createIndex(index.fields, index.options);
    },
    updateIndex: async (db, index, collection) => {
        return await db[collection].dropIndex(index.options.name)
            .then(async () => {
                return await db[collection].ensureIndex(index.fields, index.options);
            });
    },
    dropIndex: async (db, index, collection) => {
        return await db[collection].dropIndex(index.options.name);
    }
};