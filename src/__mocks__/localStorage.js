export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      //return JSON.stringify(store[key])
      return store[key]
    },
    setItem: function(key, value) {
      //store[key] = value.toString()
      store[key] = JSON.stringify(value)
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()