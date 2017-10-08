"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const observableCollection_1 = require("./observableCollection");
describe('ObservableCollection', () => {
    let observableCollection;
    beforeEach(() => {
        observableCollection = new observableCollection_1.ObservableCollection();
    });
    function createItem(id) {
        id = id || 0;
        return {
            itemId: id
        };
    }
    function verifyCollectionHasItems(observableCollection, items) {
        verifyArraysAreWithSameItems(observableCollection.items, items);
    }
    function verifyArraysAreWithSameItems(actual, expected) {
        chai_1.expect(actual).to.have.length(expected.length);
        for (let i = 0; i < expected.length; i++) {
            const actualItem = actual[i];
            const expectedItem = expected[i];
            chai_1.expect(actualItem).to.be.equal(expectedItem);
        }
    }
    function createItems(numberOfItems) {
        const result = [];
        for (let i = 0; i < numberOfItems; i++) {
            const item = createItem(i);
            result.push(item);
        }
        return result;
    }
    function registerToItemsChangedEvent(observableCollection) {
        const result = {
            actualRaisedEventArgs: []
        };
        observableCollection.itemsChanged.on((_args) => {
            result.actualRaisedEventArgs.push(_args);
        });
        return result;
    }
    function verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents) {
        chai_1.expect(eventRegistration.actualRaisedEventArgs).to.have.length(expectedEvents.length);
        for (let i = 0; i < expectedEvents.length; i++) {
            const exepctedEventArgs = expectedEvents[i];
            const actualEventArgs = eventRegistration.actualRaisedEventArgs[i];
            verifyArraysAreWithSameItems(exepctedEventArgs.added, actualEventArgs.added);
            verifyArraysAreWithSameItems(exepctedEventArgs.removed, actualEventArgs.removed);
        }
    }
    describe('constructor', () => {
        it('should initialize size correctly', () => {
            const observableCollection = new observableCollection_1.ObservableCollection();
            chai_1.expect(observableCollection.size).to.be.equal(0);
        });
    });
    describe('add', () => {
        it('adding items one by one should add them to the items', () => {
            const item1 = createItem();
            const item2 = createItem();
            observableCollection.add(item1);
            observableCollection.add(item2);
            verifyCollectionHasItems(observableCollection, [item1, item2]);
        });
        it('adding items should raise events correctly', () => {
            const item1 = createItem();
            const item2 = createItem();
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.add(item1);
            observableCollection.add(item2);
            const expectedEvents = [
                {
                    added: [item1],
                    removed: []
                },
                {
                    added: [item2],
                    removed: []
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('adding items one by one should set size correctly', () => {
            const item1 = createItem();
            const item2 = createItem();
            observableCollection.add(item1);
            observableCollection.add(item2);
            chai_1.expect(observableCollection.size).to.be.equal(2);
        });
    });
    describe('addRange', () => {
        it('adding range should add the items to the items', () => {
            const items = createItems(3);
            observableCollection.addRange(items);
            verifyCollectionHasItems(observableCollection, items);
        });
        it('adding range should raise events correctly', () => {
            const items = createItems(3);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.addRange(items);
            const expectedEvents = [
                {
                    added: items,
                    removed: []
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('adding empty range should not raise events', () => {
            const items = [];
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.addRange(items);
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('adding range should set size correctly', () => {
            const numberOfItems = 3;
            const items = createItems(numberOfItems);
            observableCollection.addRange(items);
            chai_1.expect(observableCollection.size).to.be.equal(numberOfItems);
        });
    });
    describe('removeMatching', () => {
        it('removing non existing item should not throw error', () => {
            const item = createItem();
            const removeAction = () => observableCollection.removeMatching(item);
            chai_1.expect(removeAction).to.not.throw();
        });
        it('removing non existing item should not raise events', () => {
            const item = createItem();
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatching(item);
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('removing added items should remove them', () => {
            const items = createItems(5);
            const itemToRemove = items[2];
            const expectedItems = [items[0], items[1], items[3], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeMatching(itemToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing item added multiple times should remove all', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            const expectedItems = [items[0], items[2], items[3], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeMatching(itemAppearingMultipleTimes);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing added items should raise events correctly', () => {
            const items = createItems(5);
            const itemToRemove1 = items[1];
            const itemToRemove2 = items[3];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatching(itemToRemove1);
            observableCollection.removeMatching(itemToRemove2);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemToRemove1]
                },
                {
                    added: [],
                    removed: [itemToRemove2]
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing item added multiple times should raise events correctly', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            const itemToRemove2 = items[3];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatching(itemAppearingMultipleTimes);
            observableCollection.removeMatching(itemToRemove2);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemAppearingMultipleTimes, itemAppearingMultipleTimes]
                },
                {
                    added: [],
                    removed: [itemToRemove2]
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing non existing item should not change size', () => {
            const item1 = createItem();
            const item2 = createItem();
            observableCollection.add(item1);
            observableCollection.removeMatching(item2);
            chai_1.expect(observableCollection.size).to.be.equal(1);
        });
        it('removing added items should set size correctly', () => {
            const items = createItems(5);
            const itemToRemove = items[2];
            observableCollection.addRange(items);
            observableCollection.removeMatching(itemToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(4);
        });
        it('removing item added multiple times should set size correctly', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            observableCollection.addRange(items);
            observableCollection.removeMatching(itemAppearingMultipleTimes);
            chai_1.expect(observableCollection.size).to.be.equal(4);
        });
    });
    describe('removeMatchingRange', () => {
        it('removing with null/undefined should throw error', () => {
            const nullItems = null;
            const undefinedItems = null;
            const removeWithNullAction = () => observableCollection.removeMatchingRange(nullItems);
            const removeWithUndefinedAction = () => observableCollection.removeMatchingRange(undefinedItems);
            chai_1.expect(removeWithNullAction).to.throw();
            chai_1.expect(removeWithUndefinedAction).to.throw();
        });
        it('removing with null/undefined should not raise events', () => {
            const nullItems = null;
            const undefinedItems = null;
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            const removeWithNullAction = () => observableCollection.removeMatchingRange(nullItems);
            const removeWithUndefinedAction = () => observableCollection.removeMatchingRange(undefinedItems);
            chai_1.expect(removeWithNullAction).to.throw();
            chai_1.expect(removeWithUndefinedAction).to.throw();
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('removing non existing items should not throw error', () => {
            const items = createItems(3);
            const removeAction = () => observableCollection.removeMatchingRange(items);
            chai_1.expect(removeAction).to.not.throw();
        });
        it('removing non existing item should not raise events', () => {
            const items = createItems(3);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatchingRange(items);
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('removing added items should remove them', () => {
            const items = createItems(5);
            const itemsToRemove = [items[1], items[3]];
            const expectedItems = [items[0], items[2], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeMatchingRange(itemsToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing items added multiple times should remove them', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[1];
            items.push(itemAddedMultipleTimes);
            const itemsToRemove = [items[1], items[3]];
            const expectedItems = [items[0], items[2], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeMatchingRange(itemsToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing added items should raise events correctly', () => {
            const items = createItems(5);
            const itemsToRemove1 = [items[1], items[2]];
            const itemsToRemove2 = [items[3], items[4]];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatchingRange(itemsToRemove1);
            observableCollection.removeMatchingRange(itemsToRemove2);
            const expectedEvents = [
                {
                    added: [],
                    removed: itemsToRemove1
                },
                {
                    added: [],
                    removed: itemsToRemove2
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing items added multiple times should raise events correctly', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[1];
            items.push(itemAddedMultipleTimes);
            const itemsToRemove1 = [itemAddedMultipleTimes, items[2]];
            const itemsToRemove2 = [items[3], items[4]];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeMatchingRange(itemsToRemove1);
            observableCollection.removeMatchingRange(itemsToRemove2);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemAddedMultipleTimes, items[2], itemAddedMultipleTimes]
                },
                {
                    added: [],
                    removed: itemsToRemove2
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing non existing items should set size correctly', () => {
            const items1 = createItems(2);
            observableCollection.addRange(items1);
            const items2 = createItems(3);
            observableCollection.removeMatchingRange(items2);
            chai_1.expect(observableCollection.size).to.be.equal(2);
        });
        it('removing added items should set size correctly', () => {
            const items = createItems(5);
            const itemsToRemove = [items[1], items[3]];
            observableCollection.addRange(items);
            observableCollection.removeMatchingRange(itemsToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(3);
        });
        it('removing items added multiple times should set size correctly', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[1];
            items.push(itemAddedMultipleTimes);
            const itemsToRemove = [items[1], items[3]];
            observableCollection.addRange(items);
            observableCollection.removeMatchingRange(itemsToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(3);
        });
    });
    describe('removeAtIndex', () => {
        it('removing non existing index should not throw error', () => {
            const item = createItem();
            const removeAction = () => observableCollection.removeAtIndex(0);
            chai_1.expect(removeAction).to.not.throw();
        });
        it('removing non existing index should not raise events', () => {
            const item = createItem();
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndex(123);
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('should remove item at index', () => {
            const items = createItems(5);
            const itemIndexToRemove = 2;
            const expectedItems = [items[0], items[1], items[3], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeAtIndex(itemIndexToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing index of an item added multiple times should remove only one instance', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            const expectedItems = [items[0], items[2], items[3], items[4], itemAppearingMultipleTimes];
            observableCollection.addRange(items);
            observableCollection.removeAtIndex(1);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('should raise events correctly', () => {
            const items = createItems(5);
            const itemToRemove1 = items[1];
            const itemToRemove2 = items[3];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndex(1);
            observableCollection.removeAtIndex(2);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemToRemove1]
                },
                {
                    added: [],
                    removed: [itemToRemove2]
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing index of an item added multiple times should raise events correctly', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            const itemToRemove2 = items[3];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndex(1);
            observableCollection.removeAtIndex(2);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemAppearingMultipleTimes]
                },
                {
                    added: [],
                    removed: [itemToRemove2]
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing non existing index should set size correctly', () => {
            const item1 = createItem();
            observableCollection.add(item1);
            observableCollection.removeAtIndex(10);
            chai_1.expect(observableCollection.size).to.be.equal(1);
        });
        it('remove item at index should set size correctly', () => {
            const items = createItems(5);
            const itemIndexToRemove = 2;
            observableCollection.addRange(items);
            observableCollection.removeAtIndex(itemIndexToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(4);
        });
        it('removing index of an item added multiple times should set size correctly', () => {
            const items = createItems(5);
            const itemAppearingMultipleTimes = items[1];
            items.push(itemAppearingMultipleTimes);
            observableCollection.addRange(items);
            observableCollection.removeAtIndex(1);
            chai_1.expect(observableCollection.size).to.be.equal(5);
        });
    });
    describe('removeAtIndices', () => {
        it('removing with null/undefined should throw error', () => {
            const nullIndices = null;
            const undefinedIndices = null;
            const removeWithNullAction = () => observableCollection.removeAtIndices(nullIndices);
            const removeWithUndefinedAction = () => observableCollection.removeAtIndices(undefinedIndices);
            chai_1.expect(removeWithNullAction).to.throw();
            chai_1.expect(removeWithUndefinedAction).to.throw();
        });
        it('removing with null/undefined should not raise events', () => {
            const nullIndices = null;
            const undefinedIndices = null;
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            const removeWithNullAction = () => observableCollection.removeAtIndices(nullIndices);
            const removeWithUndefinedAction = () => observableCollection.removeAtIndices(undefinedIndices);
            chai_1.expect(removeWithNullAction).to.throw();
            chai_1.expect(removeWithUndefinedAction).to.throw();
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('removing non existing indexes should not throw error', () => {
            const indices = [0, 123, 124, 1253];
            const removeAction = () => observableCollection.removeAtIndices(indices);
            chai_1.expect(removeAction).to.not.throw();
        });
        it('removing non existing indices should not raise events', () => {
            const indices = [123, 4613];
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndices(indices);
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('removing at existing indices should remove correct items', () => {
            const items = createItems(5);
            const indecesToRemove = [1, 3];
            const expectedItems = [items[0], items[2], items[4]];
            observableCollection.addRange(items);
            observableCollection.removeAtIndices(indecesToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing indices of items added multiple times should remove only at specific places', () => {
            const items = createItems(5);
            const itemIndex = 1;
            const itemAddedMultipleTimes = items[itemIndex];
            items.push(itemAddedMultipleTimes);
            const indicesToRemove = [itemIndex, 3];
            const expectedItems = [items[0], items[2], items[4], itemAddedMultipleTimes];
            observableCollection.addRange(items);
            observableCollection.removeAtIndices(indicesToRemove);
            verifyCollectionHasItems(observableCollection, expectedItems);
        });
        it('removing existing indices should raise events correctly', () => {
            const items = createItems(5);
            const itemsToRemove1 = [items[1], items[2]];
            const itemsToRemove2 = [items[3], items[4]];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndices([1, 2]);
            observableCollection.removeAtIndices([1, 2]);
            const expectedEvents = [
                {
                    added: [],
                    removed: itemsToRemove1
                },
                {
                    added: [],
                    removed: itemsToRemove2
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing indices of items added multiple times should raise events correctly', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[1];
            items.push(itemAddedMultipleTimes);
            const itemsToRemove1 = [itemAddedMultipleTimes, items[2]];
            const itemsToRemove2 = [items[3], items[4]];
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.removeAtIndices([1, 2]);
            observableCollection.removeAtIndices([1, 2]);
            const expectedEvents = [
                {
                    added: [],
                    removed: [itemAddedMultipleTimes, items[2]]
                },
                {
                    added: [],
                    removed: itemsToRemove2
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('removing non existing indexes should set size correctly', () => {
            const indices = [10, 123, 124, 1253];
            observableCollection.add(createItem());
            observableCollection.removeAtIndices(indices);
            chai_1.expect(observableCollection.size).to.be.equal(1);
        });
        it('removing at existing indices should set size correctly', () => {
            const items = createItems(5);
            const indecesToRemove = [1, 3];
            observableCollection.addRange(items);
            observableCollection.removeAtIndices(indecesToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(3);
        });
        it('removing indices of items added multiple times should remove only at specific places', () => {
            const items = createItems(5);
            const itemIndex = 1;
            const itemAddedMultipleTimes = items[itemIndex];
            items.push(itemAddedMultipleTimes);
            const indicesToRemove = [itemIndex, 3];
            observableCollection.addRange(items);
            observableCollection.removeAtIndices(indicesToRemove);
            chai_1.expect(observableCollection.size).to.be.equal(4);
        });
    });
    describe('clear', () => {
        it('calling clear on emtpy collection should not throw error', () => {
            const clearAction = () => observableCollection.clear();
            chai_1.expect(clearAction).to.not.throw();
        });
        it('calling clear on emtpy collection should not raise events', () => {
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.clear();
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, []);
        });
        it('clearing collection with items should clear it', () => {
            const items = createItems(5);
            observableCollection.addRange(items);
            observableCollection.clear();
            verifyCollectionHasItems(observableCollection, []);
        });
        it('clearing collection with items appearing multiple times should clear it', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[2];
            items.push(itemAddedMultipleTimes);
            observableCollection.addRange(items);
            observableCollection.clear();
            verifyCollectionHasItems(observableCollection, []);
        });
        it('clearing collection with items should raise events correctly', () => {
            const items = createItems(5);
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.clear();
            const expectedEvents = [
                {
                    added: [],
                    removed: items
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('clearing collection with items added multiple times should raise events correctly', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[2];
            items.push(itemAddedMultipleTimes);
            observableCollection.addRange(items);
            const eventRegistration = registerToItemsChangedEvent(observableCollection);
            observableCollection.clear();
            const expectedEvents = [
                {
                    added: [],
                    removed: items
                }
            ];
            verifyItemsChangedEventsWereRaisedCorrectly(eventRegistration, expectedEvents);
        });
        it('calling clear on emtpy collection should set size correctly', () => {
            observableCollection.clear();
            chai_1.expect(observableCollection.size).to.be.equal(0);
        });
        it('clearing collection with items should set size correctly', () => {
            const items = createItems(5);
            observableCollection.addRange(items);
            observableCollection.clear();
            chai_1.expect(observableCollection.size).to.be.equal(0);
        });
        it('clearing collection with items appearing multiple times should set size correctly', () => {
            const items = createItems(5);
            const itemAddedMultipleTimes = items[2];
            items.push(itemAddedMultipleTimes);
            observableCollection.addRange(items);
            observableCollection.clear();
            chai_1.expect(observableCollection.size).to.be.equal(0);
        });
    });
    describe('contains', () => {
        it('empty collection, should return false', () => {
            const item = {};
            const result = observableCollection.contains(item);
            chai_1.expect(result).to.be.false;
        });
        it('no such item, should return false', () => {
            const items = createItems(5);
            observableCollection.addRange(items);
            const item = {};
            const result = observableCollection.contains(item);
            chai_1.expect(result).to.be.false;
        });
        it('item inside the collection, should return true', () => {
            const item = {};
            const items = createItems(5);
            items.push(item);
            observableCollection.addRange(items);
            const result = observableCollection.contains(item);
            chai_1.expect(result).to.be.true;
        });
    });
});
//# sourceMappingURL=observableCollection.test.js.map