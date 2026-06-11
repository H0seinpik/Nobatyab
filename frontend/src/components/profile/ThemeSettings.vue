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
  <div class="flex gap-2">
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
