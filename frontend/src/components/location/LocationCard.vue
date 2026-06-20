<script setup lang="ts">
import { MapPin } from "lucide-vue-next";
import MapLocationPicker from "@/components/maps/MapLocationPicker.vue";

defineProps<{
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  height?: string;
}>();
</script>

<template>
  <div class="location-card">
    <div v-if="title || address" class="location-card__header">
      <MapPin :size="18" class="location-card__icon" />
      <div>
        <h3 v-if="title" class="location-card__title">{{ title }}</h3>
        <p v-if="address" class="location-card__address">{{ address }}</p>
      </div>
    </div>
    <MapLocationPicker
      v-if="latitude != null && longitude != null"
      :latitude="latitude"
      :longitude="longitude"
      readonly
      :height="height ?? '200px'"
    />
  </div>
</template>

<style scoped>
.location-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: var(--color-surface);
}

.location-card__header {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.location-card__icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.location-card__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.location-card__address {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
  line-height: var(--leading-relaxed);
}
</style>
