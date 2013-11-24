var superstoreSync = require("./..");
var assert = require("assert");

var tests = {};
var buggyLocalStorage = false;

// Test for localstorage bug
try {
  localStorage.test = 'test';
  localStorage.removeItem('test');
} catch (err) {
  if (err.code != 22) {
    throw err;
  }
  buggyLocalStorage = true;
}

function getLocalStorage(key) {
  if(buggyLocalStorage) {
    // We can't test the result so just return the in memory result from the API.
    return superstoreSync.get(key);
  } else {
    return localStorage[key];
  }
};


describe("superstore-sync", function() {
  before(function() {
    localStorage.clear();
  });

  it("Removing a key before it's set should be harmless", function() {
    assert.doesNotThrow(function() {
      superstoreSync.unset('keyUnset');
    });
    assert.equal(undefined, getLocalStorage('keyUnset'));
  });

  it("Should be able to set and get data against a key", function() {
    superstoreSync.set('keyOne', 'value1');
    var val = superstoreSync.get('keyOne');
    assert.equal('value1', val);
  });

  it("Should be able to read things (twice) from local storage", function() {
    superstoreSync.set("keyTwo", 3884);

    var val = superstoreSync.get('keyTwo');
    assert.equal(3884, val);
    var val2 = superstoreSync.get('keyTwo');
    assert.equal(3884, val2);
  });

  it("Should be able to unset things", function() {
    superstoreSync.set("keyThree", "Hello");
    var val = superstoreSync.unset('keyThree');
    assert.equal(undefined, getLocalStorage("keyThree"));
  });

  it("Getting an unset key should return a nully value", function() {
    var val = superstoreSync.get("keySixth");
    assert.equal(val, undefined);
  });

  if("Should json encode and decode objects", function() {
    var obj = {
      test: [1,4,6,7]
    };
    superstoreSync.set('keySeventh', obj);
    assert.equal(JSON.stringify(obj), getLocalStorage("keySeventh"));
  });

  it("#clear(something) clears only our namespaced data", function() {
    superstoreSync.set('other', '123');
    superstoreSync.set('pref.?xKeyTenth', 'A');
    superstoreSync.set('pref.?xKeyEleventh', 'B');
    superstoreSync.clear('pref.?xKey');

    assert.equal(undefined, superstoreSync.get("pref.?xKeyTenth"));
    assert.equal(undefined, superstoreSync.get("pref.?xKeyEleventh"));
    assert.equal('123',     superstoreSync.get("other"));

    assert.equal(undefined, getLocalStorage("pref.?xKeyTenth"));
    assert.equal(undefined, getLocalStorage("pref.?xKeyEleventh"));
    assert.equal('"123"',   getLocalStorage("other"));
  });

  it("#clear() clears all data", function() {
    superstoreSync.set('other', '123');
    superstoreSync.set('prefixKeyTwelth', 'C');
    superstoreSync.clear();

    assert.equal(undefined, superstoreSync.get("prefixKeyTwelth"));
    assert.equal(undefined, superstoreSync.get("other"));

    assert.equal(undefined, getLocalStorage("prefixKeyTwelth"));
    assert.equal(undefined, getLocalStorage("other"));
  });

  it("watch for changes in other processes", function() {
    superstoreSync.set('key13', 'A');

    var event = new CustomEvent("storage");
    event.key = "key13";
    event.newValue = "\"B\"";
    window.dispatchEvent(event);

    var val = superstoreSync.get('key13');
    assert.equal(val, 'B');
  });
});

