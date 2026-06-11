<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
import SkeletonText from "./SkeletonText.vue";
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <SkeletonBase class="mb-3 h-24 w-full" />
    <SkeletonText :lines="2" :widths="['70%', '50%']" />
  </div>
</template>
