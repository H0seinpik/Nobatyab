<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import UiButton from "@/components/ui/UiButton.vue";

const { isDark, toggle } = useTheme();
</script>

<template>
  <UiButton
    variant="ghost"
    :aria-label="isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'"
    @click="toggle"
  >
    {{ isDark ? "☀️" : "🌙" }}
  </UiButton>
</template>
