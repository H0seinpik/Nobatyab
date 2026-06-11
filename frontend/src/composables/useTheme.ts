import { ref, computed, watch } from "vue";

export type Theme = "light" | "dark";

const theme = ref<Theme>((localStorage.getItem("theme") as Theme) || "light");

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle("dark", value === "dark");
}

applyTheme(theme.value);

watch(theme, (value) => {
  localStorage.setItem("theme", value);
  applyTheme(value);
});

export function useTheme() {
  const isDark = computed(() => theme.value === "dark");

  function setTheme(value: Theme) {
    theme.value = value;
  }

  function toggle() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }

  return { theme, isDark, setTheme, toggle };
}
