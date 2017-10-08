"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const observableDictionary_1 = require("./observableDictionary");
const sinon_1 = require("sinon");
describe('ObservableDictionary', () => {
    function getPropertiesAndValues(object) {
        const result = [];
        for (let property in object) {
            if (!object.hasOwnProperty(property)) {
                continue;
            }
            result.push({
                property: property,
                value: object[property]
            });
        }
        return result;
    }
    function verifySamePropertiesAndValues(actual, expected) {
        chai_1.expect(actual).to.be.length(expected.length);
        for (let i = 0; i < expected.length; i++) {
            const actualPropery = actual[i].property;
            const actualValue = actual[i].value;
            const expectedProperty = expected[i].property;
            const expectedValue = expected[i].value;
            chai_1.expect(actualPropery).to.be.equal(expectedProperty);
            chai_1.expect(actualValue).to.be.equal(expectedValue);
        }
    }
    function registerToItemsChangedEvent(observableDictionary) {
        const actualArgs = [];
        observableDictionary.itemsChanged.on(_args => {
            actualArgs.push(_args);
        });
        return actualArgs;
    }
    function verifyItemsChangedWasRaisedCorrectly(actual, expected) {
        chai_1.expect(actual).to.be.length(expected.length);
        for (let i = 0; i < expected.length; i++) {
            const actualArg = actual[i];
            const expectedArg = expected[i];
            veriftyItemsChangedEventArgsAreEqual(actualArg, expectedArg);
        }
    }
    function veriftyItemsChangedEventArgsAreEqual(actual, expected) {
        verifyKeyValuesEqual(actual.added, expected.added);
        verifyKeyValuesEqual(actual.removed, expected.removed);
    }
    function verifyKeyValuesEqual(actual, expected) {
        chai_1.expect(actual).to.be.length(expected.length);
        for (let i = 0; i < expected.length; i++) {
            const actualKeyValue = actual[i];
            const expectedKeyValue = expected[i];
            chai_1.expect(actualKeyValue.key).to.be.equal(expectedKeyValue.key);
            chai_1.expect(actualKeyValue.value).to.be.equal(expectedKeyValue.value);
        }
    }
    describe('constructor', () => {
        it('should initialize with empty keys and values', () => {
            const observableDictionary = new observableDictionary_1.ObservableDictionary();
            chai_1.expect(observableDictionary.keys).to.be.empty;
            chai_1.expect(observableDictionary.values).to.be.empty;
        });
        it('should set size correctly', () => {
            const observableDictionary = new observableDictionary_1.ObservableDictionary();
            chai_1.expect(observableDictionary.size).to.be.equal(0);
        });
    });
    describe('key type is object', () => {
        testDictionaryWithConfiguration(() => ({
            key: {},
            key2: {},
            value: {},
            value2: {},
            complexKey: { a: 1, b: [2] },
            complexKey2: { a: 2, b: [3], c: '4' },
            complexValue: { c: 'c', d: ['e'] },
            complexValue2: { d: 5, e: '6' },
            createKeyValuePairs: () => {
                const numberOfPairs = 4;
                const result = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const key = { keyItem: i };
                    const value = { valueItem: i };
                    result.push({
                        key: key,
                        value: value
                    });
                }
                return result;
            }
        }));
    });
    describe('key type is string', () => {
        testDictionaryWithConfiguration(() => ({
            key: 'key',
            key2: 'key2',
            value: {},
            value2: {},
            complexKey: 'complex key',
            complexKey2: 'complex key 2',
            complexValue: { c: 'c', d: ['e'] },
            complexValue2: { d: 5, e: '6' },
            createKeyValuePairs: () => {
                const numberOfPairs = 4;
                const result = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const key = `key ${i}`;
                    const value = { valueItem: i };
                    result.push({
                        key: key,
                        value: value
                    });
                }
                return result;
            }
        }));
    });
    describe('key type is number', () => {
        testDictionaryWithConfiguration(() => ({
            key: 1,
            key2: 2,
            value: {},
            value2: {},
            complexKey: 1.23,
            complexKey2: 4.56,
            complexValue: { c: 'c', d: ['e'] },
            complexValue2: { d: 5, e: '6' },
            createKeyValuePairs: () => {
                const numberOfPairs = 4;
                const result = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const key = i;
                    const value = { valueItem: i };
                    result.push({
                        key: key,
                        value: value
                    });
                }
                return result;
            }
        }));
    });
    describe('key type is boolean', () => {
        testDictionaryWithConfiguration(() => ({
            key: true,
            key2: false,
            value: {},
            value2: {},
            complexKey: true,
            complexKey2: false,
            complexValue: { c: 'c', d: ['e'] },
            complexValue2: { d: 5, e: '6' },
            createKeyValuePairs: () => {
                const numberOfPairs = 2;
                const result = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const key = i % 2 === 0;
                    const value = { valueItem: i };
                    result.push({
                        key: key,
                        value: value
                    });
                }
                return result;
            }
        }));
    });
    function testDictionaryWithConfiguration(getConfiguration) {
        let observableDictionary;
        let configuration;
        beforeEach(() => {
            configuration = getConfiguration();
            observableDictionary = new observableDictionary_1.ObservableDictionary();
        });
        describe('add', () => {
            it('adding key value pair, should add to keys', () => {
                observableDictionary.add(configuration.key, configuration.value);
                chai_1.expect(observableDictionary.keys).to.be.length(1);
                chai_1.expect(observableDictionary.keys).to.contain(configuration.key);
            });
            it('adding key value pair, should add to values', () => {
                observableDictionary.add(configuration.key, configuration.value);
                chai_1.expect(observableDictionary.values).to.be.length(1);
                chai_1.expect(observableDictionary.values).to.contain(configuration.value);
            });
            it('adding key value pair, should add to keysAndValues', () => {
                observableDictionary.add(configuration.key, configuration.value);
                const keysAndValues = observableDictionary.keysAndValues;
                chai_1.expect(keysAndValues).to.be.length(1);
                chai_1.expect(keysAndValues[0].key).to.be.equal(configuration.key);
                chai_1.expect(keysAndValues[0].value).to.be.equal(configuration.value);
            });
            it('adding key value pair, should set size correctly', () => {
                observableDictionary.add(configuration.key, configuration.value);
                chai_1.expect(observableDictionary.size).to.be.equal(1);
            });
            it('adding multiple key value pairs, should add to keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                chai_1.expect(observableDictionary.keys).to.be.length(numberOfPairs);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    chai_1.expect(observableDictionary.keys).to.contain(pair.key);
                }
            });
            it('adding multiple key value pairs, should add to values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                chai_1.expect(observableDictionary.values).to.be.length(numberOfPairs);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    chai_1.expect(observableDictionary.values).to.contain(pair.value);
                }
            });
            it('adding multiple key value pairs, should add to keysAndValues', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const keysAndValues = observableDictionary.keysAndValues;
                chai_1.expect(keysAndValues).to.be.length(numberOfPairs);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const actualPair = keysAndValues[i];
                    chai_1.expect(actualPair.key).to.be.equal(pair.key);
                    chai_1.expect(actualPair.value).to.be.equal(pair.value);
                }
            });
            it('adding multiple key value pairs, should set size correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                chai_1.expect(observableDictionary.size).to.be.equal(numberOfPairs);
            });
            it('adding key value pair, should not affect the json representation of both', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedKeyJson = JSON.stringify(key);
                const expectedValueJson = JSON.stringify(value);
                observableDictionary.add(key, value);
                chai_1.expect(JSON.stringify(key)).to.be.equal(expectedKeyJson);
                chai_1.expect(JSON.stringify(value)).to.be.equal(expectedValueJson);
            });
            it('adding key value pair, should not affect the for in loop for the key', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedPropertiesWithValues = getPropertiesAndValues(key);
                observableDictionary.add(key, value);
                const actualPropertiesWithValues = getPropertiesAndValues(key);
                verifySamePropertiesAndValues(actualPropertiesWithValues, expectedPropertiesWithValues);
            });
            it('adding key value pair, should not affect the for in loop for the value', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedPropertiesWithValues = getPropertiesAndValues(value);
                observableDictionary.add(key, value);
                const actualPropertiesWithValues = getPropertiesAndValues(value);
                verifySamePropertiesAndValues(actualPropertiesWithValues, expectedPropertiesWithValues);
            });
            it('adding multiple key value pairs, should raise itemsChanged correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                const expectedArgs = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    expectedArgs.push({
                        added: [pair],
                        removed: []
                    });
                }
                const actualArgs = registerToItemsChangedEvent(observableDictionary);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                verifyItemsChangedWasRaisedCorrectly(actualArgs, expectedArgs);
            });
            it('adding key value pair with existing key, should override the value', () => {
                const key = configuration.key;
                const value1 = configuration.value;
                const value2 = configuration.value2;
                observableDictionary.add(key, value1);
                observableDictionary.add(key, value2);
                chai_1.expect(observableDictionary.keys).to.be.length(1);
                chai_1.expect(observableDictionary.keys).to.contain(key);
                chai_1.expect(observableDictionary.values).to.be.length(1);
                chai_1.expect(observableDictionary.values).to.contain(value2);
                chai_1.expect(observableDictionary.getValueByKey(key)).to.be.equal(value2);
                chai_1.expect(observableDictionary.containsKey(key)).to.be.true;
                chai_1.expect(observableDictionary.containsValue(value1)).to.be.false;
                chai_1.expect(observableDictionary.containsValue(value2)).to.be.true;
            });
            it('adding key value pair with existing key, should raise itemsChanged correctly', () => {
                const key = configuration.key;
                const value1 = configuration.value;
                const value2 = configuration.value2;
                observableDictionary.add(key, value1);
                const expectedArgs = [
                    {
                        added: [{ key: key, value: value2 }],
                        removed: [{ key: key, value: value1 }]
                    }
                ];
                const actualArgs = registerToItemsChangedEvent(observableDictionary);
                observableDictionary.add(key, value2);
                verifyItemsChangedWasRaisedCorrectly(actualArgs, expectedArgs);
            });
        });
        describe('remove', () => {
            it('removing non existing key, should not throw exception', () => {
                const action = () => observableDictionary.remove(configuration.key);
                chai_1.expect(action).not.to.throw();
            });
            it('removing non existing key, should set size correctly', () => {
                observableDictionary.remove(configuration.key);
                chai_1.expect(observableDictionary.size).to.be.equal(0);
            });
            it('removing key, should remove from keys', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                chai_1.expect(observableDictionary.keys).to.be.length(0);
            });
            it('removing key, should remove from values', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                chai_1.expect(observableDictionary.values).to.be.length(0);
            });
            it('removing key, should remove from keysAndValues', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                chai_1.expect(observableDictionary.keysAndValues).to.be.length(0);
            });
            it('removing key, should set size correctly', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                chai_1.expect(observableDictionary.size).to.be.equal(0);
            });
            it('removing multiple keys, should remove from keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                chai_1.expect(observableDictionary.keys).to.be.length(numberOfPairs - 2);
                chai_1.expect(observableDictionary.keys).not.to.contain(pairToRemove1.key);
                chai_1.expect(observableDictionary.keys).not.to.contain(pairToRemove2.key);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    if (pair === pairToRemove1 ||
                        pair === pairToRemove2) {
                        continue;
                    }
                    chai_1.expect(observableDictionary.keys).to.contain(pair.key);
                }
            });
            it('removing multiple keys, should remove from values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                chai_1.expect(observableDictionary.values).to.be.length(numberOfPairs - 2);
                chai_1.expect(observableDictionary.values).not.to.contain(pairToRemove1.value);
                chai_1.expect(observableDictionary.values).not.to.contain(pairToRemove2.value);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    if (pair === pairToRemove1 ||
                        pair === pairToRemove2) {
                        continue;
                    }
                    chai_1.expect(observableDictionary.values).to.contain(pair.value);
                }
            });
            it('removing multiple keys, should remove from keysAndValues', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                const keysAndValues = observableDictionary.keysAndValues;
                chai_1.expect(keysAndValues).to.be.length(numberOfPairs - 2);
                chai_1.expect(keysAndValues.map(_ => _.key)).not.to.contain(pairToRemove1.key);
                chai_1.expect(keysAndValues.map(_ => _.key)).not.to.contain(pairToRemove2.key);
                chai_1.expect(keysAndValues.map(_ => _.value)).not.to.contain(pairToRemove1.value);
                chai_1.expect(keysAndValues.map(_ => _.value)).not.to.contain(pairToRemove2.value);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    if (pair === pairToRemove1 ||
                        pair === pairToRemove2) {
                        continue;
                    }
                    chai_1.expect(keysAndValues.map(_ => _.key)).to.contain(pair.key);
                    chai_1.expect(keysAndValues.map(_ => _.value)).to.contain(pair.value);
                }
            });
            it('removing multiple keys, should set size correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                chai_1.expect(observableDictionary.size).to.be.equal(numberOfPairs - 2);
            });
            it('removing key, should not affect the json representation of both key and value', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedKeyJson = JSON.stringify(key);
                const expectedValueJson = JSON.stringify(value);
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                chai_1.expect(JSON.stringify(key)).to.be.equal(expectedKeyJson);
                chai_1.expect(JSON.stringify(value)).to.be.equal(expectedValueJson);
            });
            it('removing key, should not affect the for in loop for the key', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedPropertiesWithValues = getPropertiesAndValues(key);
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const actualPropertiesWithValues = getPropertiesAndValues(key);
                verifySamePropertiesAndValues(actualPropertiesWithValues, expectedPropertiesWithValues);
            });
            it('removing key, should not affect the for in loop for the value', () => {
                const key = configuration.complexKey;
                const value = configuration.complexValue;
                const expectedPropertiesWithValues = getPropertiesAndValues(value);
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const actualPropertiesWithValues = getPropertiesAndValues(value);
                verifySamePropertiesAndValues(actualPropertiesWithValues, expectedPropertiesWithValues);
            });
            it('removing multiple keys, should raise itemsChanged correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                const expectedArgs = [
                    {
                        added: [],
                        removed: [pairToRemove1]
                    },
                    {
                        added: [],
                        removed: [pairToRemove2]
                    }
                ];
                const actualArgs = registerToItemsChangedEvent(observableDictionary);
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                verifyItemsChangedWasRaisedCorrectly(actualArgs, expectedArgs);
            });
            it('removing by found key, should remove', () => {
                const key = { someProp: 1 };
                const value = '1';
                const dictionary = new observableDictionary_1.ObservableDictionary();
                dictionary.add(key, value);
                chai_1.expect(dictionary.size).to.be.equal(1);
                chai_1.expect(dictionary.keys).to.contain(key);
                const foundKey = dictionary.findKey(_ => _.someProp === 1);
                dictionary.remove(foundKey);
                chai_1.expect(dictionary.size).to.be.equal(0);
                chai_1.expect(dictionary.keys).to.not.contain(key);
            });
        });
        describe('containsKey', () => {
            it('non existing key, should return false', () => {
                const result = observableDictionary.containsKey(configuration.key);
                chai_1.expect(result).to.be.false;
            });
            it('adding key value pair, should contain the key', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                const result = observableDictionary.containsKey(key);
                chai_1.expect(result).to.be.true;
            });
            it('adding multiple key value pairs, should contain the keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const results = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.containsKey(pair.key);
                    results.push(result);
                }
                for (let i = 0; i < numberOfPairs; i++) {
                    chai_1.expect(results[i]).to.be.true;
                }
            });
            it('removing key, should not contain the key', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const result = observableDictionary.containsKey(key);
                chai_1.expect(result).to.be.false;
            });
            it('removing multiple keys, should not contain the keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                const results = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.containsKey(pair.key);
                    results.push(result);
                }
                chai_1.expect(results[0]).to.be.false;
                chai_1.expect(results[numberOfPairs / 2]).to.be.false;
                results.splice(numberOfPairs / 2);
                results.splice(0);
                for (let i = 0; i < results.length; i++) {
                    chai_1.expect(results[i]).to.be.true;
                }
            });
        });
        describe('containsValue', () => {
            it('non existing value, should return false', () => {
                const result = observableDictionary.containsValue(configuration.key);
                chai_1.expect(result).to.be.false;
            });
            it('adding key value pair, should contain the value', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                const result = observableDictionary.containsValue(value);
                chai_1.expect(result).to.be.true;
            });
            it('adding multiple key value pairs, should contain the values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const results = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.containsValue(pair.value);
                    results.push(result);
                }
                for (let i = 0; i < numberOfPairs; i++) {
                    chai_1.expect(results[i]).to.be.true;
                }
            });
            it('removing key, should not contain the value', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const result = observableDictionary.containsValue(value);
                chai_1.expect(result).to.be.false;
            });
            it('removing multiple keys, should not contain the values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                const results = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.containsValue(pair.value);
                    results.push(result);
                }
                chai_1.expect(results[0]).to.be.false;
                chai_1.expect(results[numberOfPairs / 2]).to.be.false;
                results.splice(numberOfPairs / 2);
                results.splice(0);
                for (let i = 0; i < results.length; i++) {
                    chai_1.expect(results[i]).to.be.true;
                }
            });
            it('not existing value, passes the == test, should return false', () => {
                observableDictionary.add(configuration.key, 0);
                chai_1.expect(observableDictionary.containsValue(false)).to.be.false;
            });
        });
        describe('getValueByKey', () => {
            it('non existing key, should throw error', () => {
                const action = () => observableDictionary.getValueByKey(configuration.key);
                chai_1.expect(action).to.throw();
            });
            it('adding key value pair, should return correct value', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                const result = observableDictionary.getValueByKey(key);
                chai_1.expect(result).to.be.equal(value);
            });
            it('adding multiple key value pairs, should return correct values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const results = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.getValueByKey(pair.key);
                    results.push(result);
                }
                for (let i = 0; i < numberOfPairs; i++) {
                    chai_1.expect(results[i]).to.be.equal(keyValuePairs[i].value);
                }
            });
            it('requesting removed key, should throw error', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const action = () => observableDictionary.getValueByKey(key);
                chai_1.expect(action).to.throw();
            });
            it('removing multiple keys, should throw error on requesting removed keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    if (pair === pairToRemove1 ||
                        pair === pairToRemove2) {
                        chai_1.expect(() => observableDictionary.getValueByKey(pair.key)).to.throw();
                        continue;
                    }
                    chai_1.expect(observableDictionary.getValueByKey(pair.key)).to.be.equal(pair.value);
                }
            });
        });
        describe('clear', () => {
            it('clear on empty dictionary, should not throw exception', () => {
                const observableDictionary = new observableDictionary_1.ObservableDictionary();
                const action = () => observableDictionary.clear();
                chai_1.expect(action).not.to.throw();
            });
            it('clear on empty dictionary, should set size correctly', () => {
                const observableDictionary = new observableDictionary_1.ObservableDictionary();
                observableDictionary.clear();
                chai_1.expect(observableDictionary.size).to.be.equal(0);
            });
            it('should clear the keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                observableDictionary.clear();
                chai_1.expect(observableDictionary.keys).to.be.length(0);
            });
            it('should clear the values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                observableDictionary.clear();
                chai_1.expect(observableDictionary.values).to.be.length(0);
            });
            it('clear on not empty dictionary, should set size correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                observableDictionary.clear();
                chai_1.expect(observableDictionary.size).to.be.equal(0);
            });
            it('should raise itemsChanged correctly', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                const expectedArgs = [{
                        added: [],
                        removed: keyValuePairs
                    }];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const actualArgs = registerToItemsChangedEvent(observableDictionary);
                observableDictionary.clear();
                verifyItemsChangedWasRaisedCorrectly(actualArgs, expectedArgs);
            });
            it('should not contain the previosley existing keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                observableDictionary.clear();
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    chai_1.expect(observableDictionary.containsKey(pair.key)).to.be.false;
                }
            });
            it('should not contain the previosley existing values', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                observableDictionary.clear();
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    chai_1.expect(observableDictionary.containsValue(pair.value)).to.be.false;
                }
            });
        });
        describe('findKey', () => {
            it('returning false for all, should return null', () => {
                const result = observableDictionary.findKey(_ => false);
                chai_1.expect(result).to.be.null;
            });
            it('adding key value pair, should return true on the key, should return the key', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                const result = observableDictionary.findKey(_ => _ === key);
                chai_1.expect(result).to.be.equal(key);
            });
            it('adding multiple key value pairs, returns true on second, should contain the second', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const result = observableDictionary.findKey(_ => _ === keyValuePairs[1].key);
                chai_1.expect(result).to.be.equal(keyValuePairs[1].key);
            });
            it('removing key, should not find the key', () => {
                const key = configuration.key;
                const value = configuration.value;
                observableDictionary.add(key, value);
                observableDictionary.remove(key);
                const result = observableDictionary.findKey(_ => _ === key);
                chai_1.expect(result).to.be.null;
            });
            it('removing multiple keys, should not find the keys', () => {
                const keyValuePairs = configuration.createKeyValuePairs();
                const numberOfPairs = keyValuePairs.length;
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    observableDictionary.add(pair.key, pair.value);
                }
                const pairToRemove1 = keyValuePairs[0];
                const pairToRemove2 = keyValuePairs[numberOfPairs / 2];
                observableDictionary.remove(pairToRemove1.key);
                observableDictionary.remove(pairToRemove2.key);
                const results = [];
                const expectedResults = [];
                for (let i = 0; i < numberOfPairs; i++) {
                    const pair = keyValuePairs[i];
                    const result = observableDictionary.findKey(_ => _ === pair.key);
                    results.push(result);
                    if (pair === pairToRemove1 || pair === pairToRemove2) {
                        expectedResults.push(null);
                    }
                    else {
                        expectedResults.push(pair.key);
                    }
                }
                for (let i = 0; i < results.length; i++) {
                    chai_1.expect(results[i]).to.be.equal(expectedResults[i]);
                }
            });
        });
        describe('multiple dictionaries', () => {
            it('adding to multiple dictionaries should contain the keys and values in all', () => {
                const key1 = configuration.key;
                const key2 = configuration.key2;
                const value1 = configuration.value;
                const value2 = configuration.value2;
                const observableDictionary1 = new observableDictionary_1.ObservableDictionary();
                const observableDictionary2 = new observableDictionary_1.ObservableDictionary();
                const observableDictionary3 = new observableDictionary_1.ObservableDictionary();
                observableDictionary1.add(key1, value1);
                observableDictionary2.add(key1, value1);
                observableDictionary3.add(key1, value1);
                observableDictionary1.add(key2, value2);
                observableDictionary2.add(key2, value2);
                observableDictionary3.add(key2, value2);
                chai_1.expect(observableDictionary1.size).to.be.equal(2);
                chai_1.expect(observableDictionary2.size).to.be.equal(2);
                chai_1.expect(observableDictionary3.size).to.be.equal(2);
                chai_1.expect(observableDictionary1.keys).to.contain(key1);
                chai_1.expect(observableDictionary1.keys).to.contain(key2);
                chai_1.expect(observableDictionary2.keys).to.contain(key1);
                chai_1.expect(observableDictionary2.keys).to.contain(key2);
                chai_1.expect(observableDictionary3.keys).to.contain(key1);
                chai_1.expect(observableDictionary3.keys).to.contain(key2);
                chai_1.expect(observableDictionary1.values).to.contain(value1);
                chai_1.expect(observableDictionary1.values).to.contain(value2);
                chai_1.expect(observableDictionary2.values).to.contain(value1);
                chai_1.expect(observableDictionary2.values).to.contain(value2);
                chai_1.expect(observableDictionary3.values).to.contain(value1);
                chai_1.expect(observableDictionary3.values).to.contain(value2);
                chai_1.expect(observableDictionary1.getValueByKey(key1)).to.be.equal(value1);
                chai_1.expect(observableDictionary2.getValueByKey(key1)).to.be.equal(value1);
                chai_1.expect(observableDictionary3.getValueByKey(key1)).to.be.equal(value1);
                chai_1.expect(observableDictionary1.getValueByKey(key2)).to.be.equal(value2);
                chai_1.expect(observableDictionary2.getValueByKey(key2)).to.be.equal(value2);
                chai_1.expect(observableDictionary3.getValueByKey(key2)).to.be.equal(value2);
                chai_1.expect(observableDictionary1.containsKey(key1)).to.be.true;
                chai_1.expect(observableDictionary1.containsKey(key2)).to.be.true;
                chai_1.expect(observableDictionary2.containsKey(key1)).to.be.true;
                chai_1.expect(observableDictionary2.containsKey(key2)).to.be.true;
                chai_1.expect(observableDictionary3.containsKey(key1)).to.be.true;
                chai_1.expect(observableDictionary3.containsKey(key2)).to.be.true;
                chai_1.expect(observableDictionary1.containsValue(value1)).to.be.true;
                chai_1.expect(observableDictionary1.containsValue(value2)).to.be.true;
                chai_1.expect(observableDictionary2.containsValue(value1)).to.be.true;
                chai_1.expect(observableDictionary2.containsValue(value2)).to.be.true;
                chai_1.expect(observableDictionary3.containsValue(value1)).to.be.true;
                chai_1.expect(observableDictionary3.containsValue(value2)).to.be.true;
            });
            it('add to multiple dictionaries, remove key from one, clear the other, should act properly', () => {
                const key1 = configuration.complexKey;
                const key2 = configuration.complexKey2;
                const value1 = configuration.complexValue;
                const value2 = configuration.complexValue2;
                const observableDictionary1 = new observableDictionary_1.ObservableDictionary();
                const observableDictionary2 = new observableDictionary_1.ObservableDictionary();
                const observableDictionary3 = new observableDictionary_1.ObservableDictionary();
                observableDictionary1.add(key1, value1);
                observableDictionary2.add(key1, value1);
                observableDictionary3.add(key1, value1);
                observableDictionary1.add(key2, value2);
                observableDictionary2.add(key2, value2);
                observableDictionary3.add(key2, value2);
                observableDictionary2.remove(key2);
                observableDictionary1.clear();
                chai_1.expect(observableDictionary1.size, 'size should be correct').to.be.equal(0);
                chai_1.expect(observableDictionary2.size, 'size should be correct').to.be.equal(1);
                chai_1.expect(observableDictionary3.size, 'size should be correct').to.be.equal(2);
                chai_1.expect(observableDictionary1.keys, 'keys should be correct').not.to.contain(key1);
                chai_1.expect(observableDictionary1.keys, 'keys should be correct').not.to.contain(key2);
                chai_1.expect(observableDictionary2.keys, 'keys should be correct').to.contain(key1);
                chai_1.expect(observableDictionary2.keys, 'keys should be correct').not.to.contain(key2);
                chai_1.expect(observableDictionary3.keys, 'keys should be correct').to.contain(key1);
                chai_1.expect(observableDictionary3.keys, 'keys should be correct').to.contain(key2);
                chai_1.expect(observableDictionary1.values, 'values should be correct').not.to.contain(value1);
                chai_1.expect(observableDictionary1.values, 'values should be correct').not.to.contain(value2);
                chai_1.expect(observableDictionary2.values, 'values should be correct').to.contain(value1);
                chai_1.expect(observableDictionary2.values, 'values should be correct').not.to.contain(value2);
                chai_1.expect(observableDictionary3.values, 'values should be correct').to.contain(value1);
                chai_1.expect(observableDictionary3.values, 'values should be correct').to.contain(value2);
                chai_1.expect(observableDictionary2.getValueByKey(key1), 'getValueByKey should return correct value').to.be.equal(value1);
                chai_1.expect(observableDictionary3.getValueByKey(key1), 'getValueByKey should return correct value').to.be.equal(value1);
                chai_1.expect(observableDictionary3.getValueByKey(key2), 'getValueByKey should return correct value').to.be.equal(value2);
                chai_1.expect(observableDictionary1.containsKey(key1), 'dictionary1 contains key1 should work ok').to.be.false;
                chai_1.expect(observableDictionary1.containsKey(key2), 'dictionary1 contains key2 should work ok').to.be.false;
                chai_1.expect(observableDictionary2.containsKey(key1), 'dictionary2 contains key1 should work ok').to.be.true;
                chai_1.expect(observableDictionary2.containsKey(key2), 'dictionary2 contains key2 should work ok').to.be.false;
                chai_1.expect(observableDictionary3.containsKey(key1), 'dictionary3 contains key1 should work ok').to.be.true;
                chai_1.expect(observableDictionary3.containsKey(key2), 'dictionary3 contains key2 should work ok').to.be.true;
                chai_1.expect(observableDictionary1.containsValue(value1), 'contains value should work ok').to.be.false;
                chai_1.expect(observableDictionary1.containsValue(value2), 'contains value should work ok').to.be.false;
                chai_1.expect(observableDictionary2.containsValue(value1), 'contains value should work ok').to.be.true;
                chai_1.expect(observableDictionary2.containsValue(value2), 'contains value should work ok').to.be.false;
                chai_1.expect(observableDictionary3.containsValue(value1), 'contains value should work ok').to.be.true;
                chai_1.expect(observableDictionary3.containsValue(value2), 'contains value should work ok').to.be.true;
            });
        });
    }
    it('add/remove different types should raise events correctly', () => {
        const dictionary = new observableDictionary_1.ObservableDictionary();
        const key1 = {};
        const key2 = 2;
        const key3 = {};
        const eventHandler = sinon_1.spy();
        dictionary.itemsChanged.on(eventHandler);
        dictionary.add(key1, {});
        dictionary.add(key2, {});
        dictionary.add(key3, {});
        dictionary.remove(key2);
        dictionary.remove(key1);
        chai_1.expect(eventHandler.callCount).to.be.equal(5, 'should be called correct number of times');
        chai_1.expect(eventHandler.args[0][0].added).to.be.length(1, 'first time should add');
        chai_1.expect(eventHandler.args[0][0].removed).to.be.length(0, 'first time should not remove');
        chai_1.expect(eventHandler.args[0][0].added[0].key).to.be.equal(key1, 'should add key1');
        chai_1.expect(eventHandler.args[1][0].added).to.be.length(1, 'second time should add');
        chai_1.expect(eventHandler.args[1][0].removed).to.be.length(0, 'second time should not remove');
        chai_1.expect(eventHandler.args[1][0].added[0].key).to.be.equal(key2, 'second time should add key2');
        chai_1.expect(eventHandler.args[2][0].added).to.be.length(1, 'third time should add');
        chai_1.expect(eventHandler.args[2][0].removed).to.be.length(0, 'third time should not remove');
        chai_1.expect(eventHandler.args[2][0].added[0].key).to.be.equal(key3, 'third time should add key3');
        chai_1.expect(eventHandler.args[3][0].added).to.be.length(0, 'fourth time should not add');
        chai_1.expect(eventHandler.args[3][0].removed).to.be.length(1, 'fourth time should remove');
        chai_1.expect(eventHandler.args[3][0].removed[0].key).to.be.equal(key2, 'fourth time should remove key2');
        chai_1.expect(eventHandler.args[4][0].added).to.be.length(0, 'fifth time should not add');
        chai_1.expect(eventHandler.args[4][0].removed).to.be.length(1, 'fifth time should remove');
        chai_1.expect(eventHandler.args[4][0].removed[0].key).to.be.equal(key1, 'fifth time should remove key1');
    });
    it('add/remove strings and numbers with same values should raise events correctly', () => {
        const dictionary = new observableDictionary_1.ObservableDictionary();
        const key1 = '2';
        const key2 = 2;
        const eventHandler = sinon_1.spy();
        dictionary.itemsChanged.on(eventHandler);
        dictionary.add(key1, {});
        dictionary.add(key2, {});
        dictionary.remove(key2);
        dictionary.remove(key1);
        chai_1.expect(eventHandler.callCount).to.be.equal(4, 'should be called correct number of times');
        chai_1.expect(eventHandler.args[0][0].added).to.be.length(1, 'first time should add');
        chai_1.expect(eventHandler.args[0][0].removed).to.be.length(0, 'first time should not remove');
        chai_1.expect(eventHandler.args[0][0].added[0].key).to.be.equal(key1, 'should add key1');
        chai_1.expect(eventHandler.args[1][0].added).to.be.length(1, 'second time should add');
        chai_1.expect(eventHandler.args[1][0].removed).to.be.length(0, 'second time should not remove');
        chai_1.expect(eventHandler.args[1][0].added[0].key).to.be.equal(key2, 'second time should add key2');
        chai_1.expect(eventHandler.args[2][0].added).to.be.length(0, 'third time should not add');
        chai_1.expect(eventHandler.args[2][0].removed).to.be.length(1, 'third time should remove');
        chai_1.expect(eventHandler.args[2][0].removed[0].key).to.be.equal(key2, 'third time should remove key2');
        chai_1.expect(eventHandler.args[3][0].added).to.be.length(0, 'fourth time should not add');
        chai_1.expect(eventHandler.args[3][0].removed).to.be.length(1, 'fourth time should remove');
        chai_1.expect(eventHandler.args[3][0].removed[0].key).to.be.equal(key1, 'fourth time should remove key1');
    });
    it('add/remove strings and boleans with same values should raise events correctly', () => {
        const dictionary = new observableDictionary_1.ObservableDictionary();
        const key1 = 'true';
        const key2 = true;
        const eventHandler = sinon_1.spy();
        dictionary.itemsChanged.on(eventHandler);
        dictionary.add(key1, {});
        dictionary.add(key2, {});
        dictionary.remove(key2);
        dictionary.remove(key1);
        chai_1.expect(eventHandler.callCount).to.be.equal(4, 'should be called correct number of times');
        chai_1.expect(eventHandler.args[0][0].added).to.be.length(1, 'first time should add');
        chai_1.expect(eventHandler.args[0][0].removed).to.be.length(0, 'first time should not remove');
        chai_1.expect(eventHandler.args[0][0].added[0].key).to.be.equal(key1, 'should add key1');
        chai_1.expect(eventHandler.args[1][0].added).to.be.length(1, 'second time should add');
        chai_1.expect(eventHandler.args[1][0].removed).to.be.length(0, 'second time should not remove');
        chai_1.expect(eventHandler.args[1][0].added[0].key).to.be.equal(key2, 'second time should add key2');
        chai_1.expect(eventHandler.args[2][0].added).to.be.length(0, 'third time should not add');
        chai_1.expect(eventHandler.args[2][0].removed).to.be.length(1, 'third time should remove');
        chai_1.expect(eventHandler.args[2][0].removed[0].key).to.be.equal(key2, 'third time should remove key2');
        chai_1.expect(eventHandler.args[3][0].added).to.be.length(0, 'fourth time should not add');
        chai_1.expect(eventHandler.args[3][0].removed).to.be.length(1, 'fourth time should remove');
        chai_1.expect(eventHandler.args[3][0].removed[0].key).to.be.equal(key1, 'fourth time should remove key1');
    });
});
//# sourceMappingURL=observableDictionary.test.js.map