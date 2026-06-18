<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <span>© {{ year }} نوبت‌یاب. تمامی حقوق محفوظ است.</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.app-footer__inner {
  display: flex;
  max-width: 72rem;
  margin-inline: auto;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
</style>
