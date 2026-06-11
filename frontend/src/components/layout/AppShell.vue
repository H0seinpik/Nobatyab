<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";

defineProps<{
  showNav?: boolean;
}>();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :show-nav="showNav" />
    <main class="flex flex-1 flex-col">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
