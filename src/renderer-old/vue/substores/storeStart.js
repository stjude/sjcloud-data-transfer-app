/*
  To-Do: convert to a Vuex.module for use in store.js
*/

export default function(ref) {
  return {
    state: {
      /** Login * */
      loginState: 'waiting',
      token: '',
    },
    getters: {
      /** Login * */
      loginState(state, getters) {
        return state.loginState;
      },
      token(state, getters) {
        return state.token;
      },
    },
    mutations: {
      /** Login * */
      setLoginState(state, status) {
        state.loginState = status;
        if (status === 'waiting') {
          state.currToolName = '';
          state.tools.splice(0, state.tools.length);
        }
      },
      setToken(state, token) {
        state.token = token;
      },
    },
    actions: {},
  };
}
