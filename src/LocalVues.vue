<template>
  <div>
    <h1>{{ code }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  code: string;
}>();



</script>

<style scoped>

</style>
