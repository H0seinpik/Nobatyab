<script setup lang="ts">
import StatusBadge from "@/components/ui/StatusBadge.vue";
import type { StatusKind } from "@/config/statuses";

defineProps<{
  status: string;
  kind?: StatusKind;
}>();
</script>

<template>
  <StatusBadge :kind="kind ?? 'appointment'" :value="status" />
</template>
