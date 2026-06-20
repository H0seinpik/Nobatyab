<script setup lang="ts">
import { RouterView } from "vue-router";
import GlobalLoadingBar from "@/components/ui/GlobalLoadingBar.vue";
import ToastProvider from "@/components/feedback/ToastProvider.vue";
import { useSessionSync } from "@/composables/useSessionSync";

useSessionSync();
</script>

<template>
  <GlobalLoadingBar />
  <ToastProvider />
  <RouterView />
</template>
