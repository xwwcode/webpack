<template>
  <div>{{ count.age }} {{count.name}}</div>
  <RouterLink to="/home">111home</RouterLink>
  <button @click="addUserAge">添加年龄</button>
  <router-view></router-view>
</template>

<script setup>
  import { useUser } from '@/store/index';
  import { ref } from "vue";
  const count = useUser()
  const addUserAge = () => {
    count.age++;  
  }
</script>
