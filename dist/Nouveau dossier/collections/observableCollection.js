"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventT_1 = require("../events/eventT");
class ObservableCollection {
    constructor() {
        this._items = [];
        this._itemsChangedEvent = new eventT_1.EventT();
    }
    get items() {
        return this._items;
    }
    get size() {
        return this._items.length;
    }
    get itemsChanged() {
        return this._itemsChangedEvent;
    }
    add(item) {
        this._items.push(item);
        this._raiseItemsAdded([item]);
    }
    addRange(items) {
        this._items.push.apply(this._items, items);
        this._raiseItemsAdded(items);
    }
    removeMatching(item) {
        const removedItems = this._items.filter(_item => _item === item);
        this._items = this._items.filter(_item => _item !== item);
        this._raiseItemsRemoved(removedItems);
    }
    removeMatchingRange(items) {
        if (!items) {
            throw 'removeRange cannot be called with null or undefined';
        }
        const removedItems = this._items.filter(_item => this._isItemInsideArray(items, _item));
        this._items =
            this._items.filter(_item => !this._isItemInsideArray(items, _item));
        this._raiseItemsRemoved(removedItems);
    }
    removeAtIndex(index) {
        if (this._items.length <= index) {
            return;
        }
        const itemToRemove = this._items[index];
        this._items.splice(index, 1);
        this._raiseItemsRemoved([itemToRemove]);
    }
    removeAtIndices(indices) {
        if (!indices) {
            throw 'removeAtIndices cannot be called with null or undefined';
        }
        const filteredItems = [];
        const removedItems = [];
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (this._isItemInsideArray(indices, i)) {
                removedItems.push(item);
            }
            else {
                filteredItems.push(item);
            }
        }
        this._items = filteredItems;
        this._raiseItemsRemoved(removedItems);
    }
    clear() {
        const removedItems = this._items;
        this._items = [];
        this._raiseItemsRemoved(removedItems);
    }
    contains(item) {
        return this._items.indexOf(item) >= 0;
    }
    _isItemInsideArray(arrayToCheckIn, item) {
        return arrayToCheckIn.indexOf(item) >= 0;
    }
    _raiseItemsAdded(items) {
        const eventArgs = {
            added: items,
            removed: []
        };
        this._raiseItemsChangedIfNeeded(eventArgs);
    }
    _raiseItemsRemoved(items) {
        const eventArgs = {
            added: [],
            removed: items
        };
        this._raiseItemsChangedIfNeeded(eventArgs);
    }
    _raiseItemsChangedIfNeeded(eventArgs) {
        if (eventArgs.added.length < 1 &&
            eventArgs.removed.length < 1) {
            return;
        }
        this._itemsChangedEvent.raise(eventArgs);
    }
}
exports.ObservableCollection = ObservableCollection;
//# sourceMappingURL=observableCollection.js.map