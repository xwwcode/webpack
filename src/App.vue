<template>
  <div>{{ count }}</div>
  <RouterLink  to="/home">111home</RouterLink >
  <router-view></router-view>

</template>


<script setup>
  import { ref } from 'vue';
  const count = ref(1)
</script>
