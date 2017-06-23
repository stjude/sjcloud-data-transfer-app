const state = require('../../../src/state.js');
state.getState(function (state) {
    console.log(state);
});