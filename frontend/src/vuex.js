export default {
  state: {
    user: null,
  },
  mutations: {
    updateFlag(state, iso) {
      state.user.flag = iso;
    },
  },
};
