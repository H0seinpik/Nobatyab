<script setup lang="ts">
import Avatar from "@/components/ui/Avatar.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import LocationCard from "@/components/location/LocationCard.vue";
import RatingStars from "@/components/reviews/RatingStars.vue";
import ReviewCard from "@/components/reviews/ReviewCard.vue";
import { Clock, Shield } from "lucide-vue-next";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

const props = defineProps<{
  fullName: string;
  avatarUrl?: string | null;
  specialization?: string | null;
  bio?: string | null;
  slotDurationMinutes: number;
  avgRating: number;
  reviewCount: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cancellationPolicy?: { minHoursBefore: number; description: string | null } | null;
  reviews?: ReviewItem[];
}>();
</script>

<template>
  <aside class="provider-profile-sidebar">
    <UiCard class="provider-profile-sidebar__profile">
      <Avatar :name="fullName" :image-url="avatarUrl" size="md" />
      <h1 class="provider-profile-sidebar__name">{{ fullName }}</h1>
      <p v-if="specialization" class="provider-profile-sidebar__specialization">
        {{ specialization }}
      </p>
      <RatingStars v-if="reviewCount > 0" :rating="avgRating" show-value size="md" />
      <p v-if="bio" class="provider-profile-sidebar__bio">{{ bio }}</p>
      <UiBadge>
        <Clock :size="14" />
        {{ slotDurationMinutes }} دقیقه هر اسلات
      </UiBadge>
      <div v-if="cancellationPolicy" class="provider-profile-sidebar__policy">
        <Shield :size="16" />
        <span>لغو حداقل {{ cancellationPolicy.minHoursBefore }} ساعت قبل</span>
      </div>
    </UiCard>

    <LocationCard
      v-if="latitude != null && longitude != null"
      title="موقعیت"
      :address="address"
      :latitude="latitude"
      :longitude="longitude"
    />

    <UiCard v-if="reviews?.length" class="provider-profile-sidebar__reviews">
      <h2 class="heading-card">نظرات</h2>
      <ReviewCard
        v-for="r in reviews.slice(0, 3)"
        :key="r.id"
        :rating="r.rating"
        :comment="r.comment"
        :author-name="r.authorName"
        :created-at="new Date(r.createdAt).toLocaleDateString('fa-IR')"
      />
    </UiCard>
  </aside>
</template>

<style scoped>
.provider-profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.provider-profile-sidebar__profile {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: flex-start;
}

.provider-profile-sidebar__avatar {
  width: 5rem;
  height: 5rem;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.provider-profile-sidebar__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--text-2xl);
  font-weight: 700;
}

.provider-profile-sidebar__name {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.provider-profile-sidebar__specialization {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.provider-profile-sidebar__bio {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.provider-profile-sidebar__policy {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.provider-profile-sidebar__reviews {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
