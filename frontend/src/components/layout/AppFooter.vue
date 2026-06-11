<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm text-[var(--color-muted)]">
      <span>© {{ year }} نوبت‌یاب. تمامی حقوق محفوظ است.</span>
    </div>
  </footer>
</template>
