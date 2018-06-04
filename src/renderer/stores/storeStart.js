export default function(ref) {
  return {
    state: {
      loginState: 'waiting',
      token: '',
    },
    getters: {
      loginState(state, getters) {
        return state.loginState;
      },
      token(state, getters) {
        return state.token;
      },
    },
    mutations: {
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
