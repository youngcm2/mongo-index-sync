const vows = require('vows');
const assert = require('assert');

const collectIndexDetailsFromFile = require('../src/collectIndexDetailsFromFile.js');

const suite = vows.describe('reading index javascript file');

suite.addBatch({
    'test1.json': {
        topic: async function () {
            await collectIndexDetailsFromFile(__dirname + '/test1.json');
        },
        'is an object': (err, collections) => {
            assert.isObject(collections);
            assert.isNotNull(collections);
            console.log(arguments);
        }/*,
        'contains a collection': (err, collections) => {
            assert.isArray(collections.organizations);
        },
        'collection contains a single index': collections => {
            assert.lengthOf(collections.organizations, 1);
        },
        'index name': collections => {
            assert.equal(collections.organizations[0].options.name, 'domains');
        },
        'contains field': collections => {
            assert.equal(collections.organizations[0].fields.domains, 1);
        }*/
    },
/*
    'test2.json': {
        topic: async () => {
            await collectIndexDetailsFromFile(__dirname + '/test2.json');
        },
        'contains a collection': collections => {
            assert.isArray(collections.organizations);
        },
        'collection contains two indexes': collections => {
            assert.lengthOf(collections.organizations, 2);
        },
        'index names': collections => {
            assert.equal(collections.organizations[0].options.name, 'domains');
            assert.equal(collections.organizations[1].options.name, 'fieldA_B');
        },
        'contains correct fields': collections => {
            assert.equal(collections.organizations[0].fields.domains, 1);
            assert.equal(collections.organizations[1].fields.fieldA, -1);
            assert.equal(collections.organizations[1].fields.fieldB, 1);
        },

        'test3.json': {
            topic: async () => {
                await collectIndexDetailsFromFile(__dirname + '/test3.json');
            },
            'contains appropriate collection': collections => {
                assert.isArray(collections.collection1);
                assert.isArray(collections.collection2);
            },
            'collections contains two indexes': collections => {
                assert.lengthOf(collections.collection1, 2);
                assert.lengthOf(collections.collection2, 1);
            },
            'index names': collections => {
                assert.equal(collections.collection1[0].options.name, 'field_A_B_C');
                assert.equal(collections.collection1[1].options.name, 'unique_B_Z');
            },
            'is unique': collections => {
                assert.isUndefined(collections.collection1[0].options.unique);
                assert.isTrue(collections.collection1[1].options.unique);
            },
            'contains correct fields': collections => {
                assert.equal(collections.collection1[0].fields.fieldA, 1);
                assert.equal(collections.collection1[0].fields.fieldB, -1);
                assert.equal(collections.collection1[0].fields.fieldC, 1);
                assert.equal(collections.collection1[1].fields.fieldB, 1);
                assert.equal(collections.collection1[1].fields.fieldZ, 1);
                assert.equal(collections.collection2[0].fields.lastChangeDate, -1);
            }
        }
    } */
});

suite.export(module);
 