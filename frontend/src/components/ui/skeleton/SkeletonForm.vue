<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";

withDefaults(defineProps<{ fields?: number }>(), { fields: 4 });
</script>

<template>
  <div class="skeleton-form">
    <div v-for="i in fields" :key="i" class="skeleton-form__field">
      <SkeletonBase class="skeleton--label" />
      <SkeletonBase class="skeleton--field" />
    </div>
    <SkeletonBase class="skeleton--submit" />
  </div>
</template>

<style scoped>
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
