const _ = require('underscore');
const extend = require('extend');

const collectIndexDetailsFromDatabase = require('./collectIndexDetailsFromDatabase');
const mongoist = require('mongoist');
const writeIndexDetailsToFile = require('./writeIndexDetailsToFile');

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

    let indexes = await collectIndexDetailsFromDatabase(db);

    await writeIndexDetailsToFile(options.file, indexes);
}

function afterConnect(db, file, drop, dry, callback) {
    collectIndexDetailsFromDatabase(db, function (err, indexesFromDatabase) {
        if (err) {
            callback(err);
            return;
        }

        const collections = Object.keys(indexesFromDatabase);
        collections.forEach(function (collection) {
            console.log('Collection: ' + collection);
            console.log('--------------------------------------------------------------------');

            indexesFromDatabase[collection]

        });

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
    if (_.isEqual(a.fields, b.fields)) {
        return true;
    }
    return false;
}

function displayIndex(index) {
    if (index.options.name) {
        console.log('  ' + index.options.name);
    }
    else {
        console.log('  ' + JSON.stringify(index.fields));
    }
}