const mongoist = require('mongoist');

const _ = require('underscore');
const extend = require('extend');
const async = require('async');

const collectIndexDetailsFromDatabase = require('./collectIndexDetailsFromDatabase');
const collectIndexDetailsFromFile = require('./collectIndexDetailsFromFile');
const indexUpdater = require('./indexUpdater');

const DEFAULT_INDEX_OPTIONS = {
    sparse: false,
    unique: false
};

module.exports = async (options) => {
    // set default options

    options.url = options.url || 'mongodb://localhost:27017';
    options.drop = options.drop || false;
    options.dry = options.dry || false;

    const db = mongoist(options.url);

    const indexesFromDatabase = await collectIndexDetailsFromDatabase(db);
    const indexesFromFile = await collectIndexDetailsFromFile(options.file);

    const collections = _.union(Object.keys(indexesFromDatabase), Object.keys(indexesFromFile));
    const newIndexes = {};
    const obsoleteIndexes = {};
    const updatedIndexes = {};

    collections.forEach(function (collection) {
        console.log('Collection: ' + collection);
        console.log('--------------------------------------------------------------------');
        newIndexes[collection] = indexDiff(indexesFromFile[collection], indexesFromDatabase[collection]);
        obsoleteIndexes[collection] = indexDiff(indexesFromDatabase[collection], indexesFromFile[collection]);
        updatedIndexes[collection] = findUpdatedIndexes(indexesFromFile[collection], indexesFromDatabase[collection]);

        console.log('New indexes: ');
        newIndexes[collection].forEach(displayIndex);

        console.log('Updated indexes: ');
        updatedIndexes[collection].forEach(displayIndex);

        console.log('Obsolete indexes: ');
        obsoleteIndexes[collection].forEach(displayIndex);

        console.log('');
    });

    if (!options.dry) {

        await async.eachSeries(collections, async collection => {

            console.log('Creating new indexes on ' + collection + '...');
            await async.eachSeries(newIndexes[collection], async index => {
                await indexUpdater.createIndex(db, index, collection);
            });

            console.log('Updating existing indexes on ' + collection + '...');
            await async.eachSeries(updatedIndexes[collection], async (index) => {
                await indexUpdater.updateIndex(db, index, collection);
            });

            if (options.drop) {
                console.log('Dropping obsolete indexes on ' + collection + '...');
                await async.eachSeries(obsoleteIndexes[collection], async (index) => {
                    await indexUpdater.dropIndex(db, index, collection);
                });
            }
        });
    }

    /**
     * Generic function for comparing 2 sets of indexes.  The result will be A-B, that is, everything in A that is *not* in B.
     */
    function indexDiff(a, b) {
        return _.reject(a, function (indexFromA) {
            return containsEquivalentIndex(b, indexFromA);
        });
    }

    function findUpdatedIndexes(a, b) {
        return commonIndexes(a, b).filter(function (baseline) {
            const comparison = findEquivalentIndex(b, baseline);
            return !_.isEqual(extend({}, baseline.options, DEFAULT_INDEX_OPTIONS), extend({}, comparison.options, DEFAULT_INDEX_OPTIONS)) ||
                !_.isEqual(baseline.fields, comparison.fields);
        });
    }

    /**
     * Given two collections of unequal (in terms of object equality (===)), find which indexes are common to both sets and
     * are considered equivalent
     */
    function commonIndexes(a, b) {
        return _.filter(a, function (indexFromA) {
            return containsEquivalentIndex(b, indexFromA);
        });
    }

    function containsEquivalentIndex(indexes, desiredIndex) {
        return findEquivalentIndex(indexes, desiredIndex) != null;
    }

    function findEquivalentIndex(indexes, desiredIndex) {
        return _.find(indexes, function (possibleMatch) {
            return isSameIndex(desiredIndex, possibleMatch);
        });
    }

    /**
     * Predicate to compare two index objects and determine if they are equivalent in
     * terms of identity.  Identity is defined as having the same name or no name, but the same set of index fields.
     *
     * This function intentionally does not compare the index options (like unique or sparse).  We use this function
     * to find new indexes, obsolete indexes and common (intersection) indexes.  We then compare the common indexes
     * for non-identity changes and then become the "updated indexes" which we need to drop and re-create.
     */
    function isSameIndex(a, b) {
        if (a.options.name && a.options.name === b.options.name) {
            return true;
        }

        return !!_.isEqual(a.fields, b.fields);
    }

    function displayIndex(index) {
        if (index.options.name) {
            console.log('  ' + index.options.name);
        }
        else {
            console.log('  ' + JSON.stringify(index.fields));
        }
    }
};