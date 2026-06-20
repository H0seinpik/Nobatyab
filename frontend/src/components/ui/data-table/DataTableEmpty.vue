<script setup lang="ts">
import EmptyState from "@/components/feedback/EmptyState.vue";
import { Inbox } from "lucide-vue-next";

defineProps<{ text?: string }>();
</script>

<template>
  <EmptyState
    :icon="Inbox"
    :title="text ?? 'موردی یافت نشد'"
    description="داده‌ای برای نمایش وجود ندارد."
  />
</template>
