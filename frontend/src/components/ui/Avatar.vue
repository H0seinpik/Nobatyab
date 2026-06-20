<script setup lang="ts">
import { computed } from "vue";
import { resolveUploadUrl } from "@/utils/uploadUrl";

const props = defineProps<{
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}>();

const src = computed(() => resolveUploadUrl(props.imageUrl ?? null));
const initials = computed(() => props.name.trim().charAt(0) || "?");

const sizeClass = computed(() => `avatar--${props.size ?? "md"}`);
</script>

<template>
  <div class="avatar" :class="sizeClass" role="img" :aria-label="name">
    <img v-if="src" :src="src" :alt="name" class="avatar__img" />
    <span v-else class="avatar__initials">{{ initials }}</span>
  </div>
</template>

<style scoped>
.avatar {
  overflow: hidden;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 700;
}

.avatar--sm {
  width: 2.75rem;
  height: 2.75rem;
  font-size: var(--text-base);
}

.avatar--md {
  width: 5rem;
  height: 5rem;
  font-size: var(--text-2xl);
}

.avatar--lg {
  width: 6rem;
  height: 6rem;
  font-size: var(--text-2xl);
}

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__initials {
  line-height: 1;
}
</style>
