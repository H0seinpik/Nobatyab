<script setup lang="ts">
import { RouterView } from "vue-router";
import GlobalLoadingBar from "@/components/ui/GlobalLoadingBar.vue";
</script>

<template>
  <GlobalLoadingBar />
  <RouterView />
</template>
