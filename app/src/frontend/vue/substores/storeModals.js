/*
  To-Do: convert to a Vuex.module for use in store.js
*/

export default {
  state: {
    menuIsVisible: false,
    modalIsVisible: false,
    tourHint: false,
    modals: {
      toolkit: 0,
    },
  },
  getters: {
    modalVisibility(state, getters) {
      return name => state.modals[name];
    },
    menuIsVisible(state) {
      return state.menuIsVisible;
    },
    modalIsVisible(state) {
      return state.modalIsVisible;
    },
    tourHint(state) {
      return state.tourHint;
    },
  },
  mutations: {
    /** Modals * */
    showModal(state, name) {
      state.modals[name] = 1;
    },
    hideModal(state, name) {
      state.modals[name] = 0;
    },

    toggleMenu(state) {
      state.menuIsVisible = !state.menuIsVisible;
    },
    closeMenu(state) {
      state.menuIsVisible = false;
    },
    openMenu(state) {
      state.menuIsVisible = true;
    },
    toggleModal(state) {
      state.modalIsVisible = !state.modalIsVisible;
    },
    closeModal(state) {
      state.modalIsVisible = false;
    },
    setTourHint(state, bool) {
      state.tourHint = bool;
    },
  },
  actions: {

  },
};
