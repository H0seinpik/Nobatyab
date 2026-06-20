<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Briefcase, MapPin } from "lucide-vue-next";
import UiCard from "@/components/ui/UiCard.vue";
import RatingStars from "@/components/reviews/RatingStars.vue";
import { resolveUploadUrl } from "@/utils/uploadUrl";

defineProps<{
  id: string;
  fullName: string;
  bio?: string | null;
  specialization?: string | null;
  avatarUrl?: string | null;
  serviceCount?: number;
  avgRating?: number | null;
  reviewCount?: number;
  address?: string | null;
  distanceKm?: number | null;
  to?: string;
}>();
</script>

<template>
  <RouterLink :to="to ?? `/providers/${id}`" class="provider-card">
    <UiCard class="provider-card__inner">
      <div class="provider-card__header">
        <img
          v-if="avatarUrl"
          :src="resolveUploadUrl(avatarUrl) ?? ''"
          :alt="fullName"
          class="provider-card__avatar"
        />
        <div v-else class="provider-card__avatar provider-card__avatar--placeholder">
          {{ fullName.charAt(0) }}
        </div>
        <div class="provider-card__info">
          <h3 class="provider-card__name">{{ fullName }}</h3>
          <p v-if="specialization" class="provider-card__specialization">
            {{ specialization }}
          </p>
          <RatingStars
            v-if="avgRating != null && avgRating > 0"
            :rating="avgRating"
            size="sm"
            show-value
          />
        </div>
      </div>
      <p v-if="bio" class="provider-card__bio">{{ bio }}</p>
      <div class="provider-card__meta">
        <span v-if="serviceCount != null" class="provider-card__stat">
          <Briefcase :size="14" />
          {{ serviceCount }} خدمت
        </span>
        <span v-if="distanceKm != null" class="provider-card__stat">
          <MapPin :size="14" />
          {{ distanceKm.toFixed(1) }} کیلومتر
        </span>
        <span v-else-if="address" class="provider-card__stat">
          <MapPin :size="14" />
          {{ address }}
        </span>
      </div>
    </UiCard>
  </RouterLink>
</template>

<style scoped>
.provider-card {
  display: block;
  color: inherit;
  text-decoration: none;
}

.provider-card__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.provider-card:hover .provider-card__inner {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.provider-card__header {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.provider-card__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.provider-card__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--text-xl);
  font-weight: 700;
}

.provider-card__info {
  flex: 1;
  min-width: 0;
}

.provider-card__name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.provider-card__specialization {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.provider-card__bio {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.provider-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}

.provider-card__stat {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-muted);
}
</style>
