import { defineStore } from 'pinia';

export const  useUser = defineStore("useUser", {
  state: () => {
    return {
      age: 18,
      name: '消化'
    }
  },
  getters: {
    fatherAge(state) {
      return state.age + 18;
    }
  },
  //异步操作
  actions: {
    addUserAge() {
      this.age++;
    }
  },
  persist: {
    storage: sessionStorage
  }
})