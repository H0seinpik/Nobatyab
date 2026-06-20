<script setup lang="ts">
import { Toaster } from "vue-sonner";
</script>

<template>
  <Toaster
    position="top-center"
    dir="rtl"
    :toast-options="{
      style: {
        fontFamily: 'var(--font-family)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
    }"
  />
</template>

<style>
[data-sonner-toaster] {
  z-index: var(--z-toast) !important;
}
</style>
