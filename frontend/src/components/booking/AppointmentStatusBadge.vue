<script setup lang="ts">
import UiBadge from "@/components/ui/UiBadge.vue";

defineProps<{ status: string }>();

const map: Record<string, { label: string; tone: "default" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "در انتظار", tone: "warning" },
  CONFIRMED: { label: "تایید شده", tone: "info" },
  COMPLETED: { label: "انجام شده", tone: "success" },
  CANCELLED: { label: "لغو شده", tone: "danger" },
  PAID: { label: "پرداخت شده", tone: "success" },
};
</script>

<template>
  <UiBadge :tone="map[status]?.tone ?? 'default'">{{ map[status]?.label ?? status }}</UiBadge>
</template>
