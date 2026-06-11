<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";

withDefaults(defineProps<{ fields?: number }>(), { fields: 4 });
</script>

<template>
  <div class="space-y-4">
    <div v-for="i in fields" :key="i" class="space-y-2">
      <SkeletonBase class="h-3 w-24" />
      <SkeletonBase class="h-10 w-full" />
    </div>
    <SkeletonBase class="mt-2 h-10 w-full" />
  </div>
</template>
