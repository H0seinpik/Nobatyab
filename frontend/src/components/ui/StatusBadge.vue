<script setup lang="ts">
import { computed } from "vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import { getStatusConfig, type StatusKind } from "@/config/statuses";

const props = defineProps<{
  kind: StatusKind;
  value: unknown;
}>();

const config = computed(() => getStatusConfig(props.kind, props.value));
</script>

<template>
  <UiBadge :tone="config.tone">{{ config.label }}</UiBadge>
</template>
