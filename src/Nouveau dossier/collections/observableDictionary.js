"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventT_1 = require("../events/eventT");
class ObservableDictionary {
    constructor() {
        this._dictionaryId = this._getNewObservabledDictionaryId();
        this._keyIdPropertyName = this._createKeyIdPropertyNameForCurrentDictionary();
        this._lastKeyId = 0;
        this._resetDictionary();
        this._itemsChanged = new eventT_1.EventT();
    }
    get keys() {
        const result = [];
        for (const keyId in this._keyIdsToKeysMap) {
            if (!this._keyIdsToKeysMap.hasOwnProperty(keyId)) {
                continue;
            }
            const key = this._keyIdsToKeysMap[keyId];
            result.push(key);
        }
        return result;
    }
    get values() {
        const result = [];
        for (const keyId in this._keyIdsToValuesMap) {
            if (!this._keyIdsToValuesMap.hasOwnProperty(keyId)) {
                continue;
            }
            const value = this._keyIdsToValuesMap[keyId];
            result.push(value);
        }
        return result;
    }
    get keysAndValues() {
        return this._getAllKeyValuePairs();
    }
    get size() {
        return this._size;
    }
    get itemsChanged() {
        return this._itemsChanged;
    }
    add(key, value) {
        if (this.containsKey(key)) {
            this._overrideExistingKeyValuePair(key, value);
        }
        else {
            this._size++;
            this._addNewKeyValuePair(key, value);
        }
    }
    remove(key) {
        if (!this.containsKey(key)) {
            console.log('not contains');
            return;
        }
        this._size--;
        const removedValue = this._removeWithoutRaisingEventAndReturnRemovedValue(key);
        const removedPair = {
            key: key,
            value: removedValue
        };
        this._raiseItemsChanged([], [removedPair]);
    }
    findKey(predicate) {
        const keys = this.keys;
        for (let i = 0; i < keys.length; i++) {
            if (predicate(keys[i])) {
                return keys[i];
            }
        }
        return null;
    }
    containsKey(key) {
        if (this._isObject(key)) {
            return this._keyIdPropertyName in key;
        }
        return this._keyIdsToKeysMap[this._getKeyIdForNotObject(key)] === key;
    }
    containsValue(value) {
        for (const keyId in this._keyIdsToValuesMap) {
            if (!this._keyIdsToValuesMap.hasOwnProperty(keyId)) {
                continue;
            }
            const existingValue = this._keyIdsToValuesMap[keyId];
            if (value === existingValue) {
                return true;
            }
        }
        return false;
    }
    getValueByKey(key) {
        if (!this.containsKey(key)) {
            throw 'The key is not inside the dictionary';
        }
        const keyId = this._getKeyIdFromKey(key);
        return this._keyIdsToValuesMap[keyId];
    }
    clear() {
        const removedPairs = this._getAllKeyValuePairs();
        for (let i = 0; i < removedPairs.length; i++) {
            const key = removedPairs[i].key;
            this._removeIdFromKey(key);
        }
        this._resetDictionary();
        this._raiseItemsChanged([], removedPairs);
    }
    _getNewObservabledDictionaryId() {
        const newId = ObservableDictionary._observableDictionaryId;
        ObservableDictionary._observableDictionaryId++;
        return newId;
    }
    _getNewKeyIdForObject() {
        this._lastKeyId++;
        return `obect_key_id_${this._lastKeyId}`;
    }
    _getKeyIdForNotObject(key) {
        if (typeof key === 'number') {
            return `not_object_number_${key}`;
        }
        else if (typeof key === 'boolean') {
            return `not_object_boolean_${key}`;
        }
        else if (typeof key === 'string') {
            return `not_object_string_${key}`;
        }
        else {
            return `not_obect_${key}`;
        }
    }
    _createKeyIdPropertyNameForCurrentDictionary() {
        return '__$observableDictionary' + this._dictionaryId + '$keyId$__';
    }
    _addNewKeyValuePair(key, value) {
        this._addNewKeyValuePairWithoutRaisingEvent(key, value);
        const addedPair = {
            key: key,
            value: value
        };
        this._raiseItemsChanged([addedPair], []);
    }
    _overrideExistingKeyValuePair(key, value) {
        const removedValue = this._removeWithoutRaisingEventAndReturnRemovedValue(key);
        this._addNewKeyValuePairWithoutRaisingEvent(key, value);
        const addedPair = {
            key: key,
            value: value
        };
        const removedPair = {
            key: key,
            value: removedValue
        };
        this._raiseItemsChanged([addedPair], [removedPair]);
    }
    _addNewKeyValuePairWithoutRaisingEvent(key, value) {
        const keyId = this._defineKeyId(key);
        this._keyIdsToKeysMap[keyId] = key;
        this._keyIdsToValuesMap[keyId] = value;
    }
    _removeWithoutRaisingEventAndReturnRemovedValue(key) {
        const keyId = this._getKeyIdFromKey(key);
        this._removeIdFromKey(key);
        this._removeKeyFromMap(keyId);
        const value = this._removeValueFromValues(keyId);
        return value;
    }
    _raiseItemsChanged(added, removed) {
        this._itemsChanged.raiseSafe({
            added: added,
            removed: removed
        });
    }
    _getAllKeyValuePairs() {
        const result = [];
        for (const keyId in this._keyIdsToKeysMap) {
            if (!this._keyIdsToKeysMap.hasOwnProperty(keyId)) {
                continue;
            }
            const key = this._keyIdsToKeysMap[keyId];
            const value = this._keyIdsToValuesMap[keyId];
            result.push({
                key: key,
                value: value
            });
        }
        return result;
    }
    _defineKeyId(key) {
        if (!this._isObject(key)) {
            return this._getKeyIdForNotObject(key);
        }
        const keyId = this._getNewKeyIdForObject();
        const propertyDescriptor = {
            configurable: true,
            enumerable: false,
            writable: false,
            value: keyId
        };
        Object.defineProperty(key, this._keyIdPropertyName, propertyDescriptor);
        return keyId;
    }
    _getKeyIdFromKey(key) {
        if (this._isObject(key)) {
            return key[this._keyIdPropertyName];
        }
        else {
            return this._getKeyIdForNotObject(key);
        }
    }
    _removeIdFromKey(key) {
        if (this._isObject(key)) {
            delete key[this._keyIdPropertyName];
        }
    }
    _removeKeyFromMap(keyId) {
        delete this._keyIdsToKeysMap[keyId];
    }
    _removeValueFromValues(keyId) {
        const value = this._keyIdsToValuesMap[keyId];
        delete this._keyIdsToValuesMap[keyId];
        return value;
    }
    _resetDictionary() {
        this._keyIdsToKeysMap = {};
        this._keyIdsToValuesMap = {};
        this._size = 0;
    }
    _isObject(key) {
        return typeof key === 'object';
    }
}
ObservableDictionary._observableDictionaryId = 0;
exports.ObservableDictionary = ObservableDictionary;
//# sourceMappingURL=observableDictionary.js.map