<script setup lang="ts">
import { useTheme, type Theme } from "@/composables/useTheme";
import UiButton from "@/components/ui/UiButton.vue";

const { theme, setTheme } = useTheme();

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "روشن" },
  { value: "dark", label: "تاریک" },
];
</script>

<template>
  <div class="theme-settings">
    <UiButton
      v-for="opt in options"
      :key="opt.value"
      :variant="theme === opt.value ? 'primary' : 'secondary'"
      @click="setTheme(opt.value)"
    >
      {{ opt.label }}
    </UiButton>
  </div>
</template>

<style scoped>
.theme-settings {
  display: flex;
  gap: 0.5rem;
}
</style>
