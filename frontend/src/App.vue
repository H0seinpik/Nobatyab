<script setup lang="ts">
import { RouterView } from "vue-router";
import GlobalLoadingBar from "@/components/ui/GlobalLoadingBar.vue";
import { useSessionSync } from "@/composables/useSessionSync";

useSessionSync();
</script>

<template>
  <GlobalLoadingBar />
  <RouterView />
</template>
