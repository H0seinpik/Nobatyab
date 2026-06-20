<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { formatPersianNumber } from "@/utils/numbers";
import { useProviderBooking } from "@/composables/useProviderBooking";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import WeeklyBookingCalendar from "@/components/booking/WeeklyBookingCalendar.vue";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid.vue";
import BookingStepHeader from "@/components/booking/BookingStepHeader.vue";
import ConfirmBookingPanel from "@/components/booking/ConfirmBookingPanel.vue";
import ProviderProfileSidebar from "@/components/provider/ProviderProfileSidebar.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const route = useRoute();
const auth = useAuthStore();
const providerId = route.params.id as string;

const {
  provider,
  reviews,
  selectedServiceId,
  jalaliDate,
  weekStart,
  slots,
  availableDates,
  selectedSlot,
  loading,
  slotsLoading,
  daysLoading,
  booking,
  bookingError,
  slotsError,
  bookingStep,
  countdownFormatted,
  isExpired,
  holdActive,
  guestValues,
  fieldError,
  touch,
  canBook,
  onWeekChange,
  onSlotSelect,
  book,
  init,
} = useProviderBooking(providerId);

onMounted(() => {
  void init();
});
</script>

<template>
  <div v-if="loading" class="provider-detail-page__grid">
    <SkeletonCard />
    <SkeletonForm :fields="5" />
  </div>
  <ContentFade v-else-if="provider">
    <div class="provider-detail-page">
      <ProviderProfileSidebar
        :full-name="provider.user.fullName"
        :avatar-url="provider.user.avatarUrl"
        :specialization="provider.specialization"
        :bio="provider.bio"
        :slot-duration-minutes="provider.slotDurationMinutes"
        :avg-rating="provider.avgRating"
        :review-count="provider.reviewCount"
        :address="provider.address"
        :latitude="provider.latitude"
        :longitude="provider.longitude"
        :cancellation-policy="provider.cancellationPolicy"
        :reviews="reviews"
      />

      <UiCard class="provider-detail-page__booking">
        <BookingStepHeader :step="bookingStep" />

        <label class="field">
          <span class="field__label">انتخاب خدمت</span>
          <select v-model="selectedServiceId" class="form-control">
            <option v-for="ps in provider.providerServices" :key="ps.id" :value="ps.id">
              {{ ps.service.name }} — {{ ps.duration }} دقیقه — {{ formatPersianNumber(Number(ps.price)) }} تومان
            </option>
          </select>
        </label>

        <WeeklyBookingCalendar
          v-model="jalaliDate"
          :available-dates="availableDates"
          :loading="daysLoading"
          :week-start="weekStart"
          class="provider-detail-page__calendar"
          @week-change="onWeekChange"
        />

        <TimeSlotGrid
          :slots="slots"
          :loading="slotsLoading"
          :has-date-selected="!!jalaliDate"
          :error-message="slotsError || undefined"
          :selected="selectedSlot?.startAt ?? null"
          class="provider-detail-page__slots"
          @select="onSlotSelect"
        />

        <ConfirmBookingPanel
          :is-authenticated="auth.isAuthenticated"
          :guest-full-name="guestValues.guestFullName"
          :guest-phone="guestValues.guestPhone ?? ''"
          :guest-email="guestValues.guestEmail ?? ''"
          :notes="guestValues.notes ?? ''"
          :field-error="(field) => fieldError(field as 'guestFullName' | 'guestPhone' | 'guestEmail' | 'notes')"
          :booking-error="bookingError"
          :can-book="canBook"
          :booking="booking"
          :hold-active="holdActive"
          :has-selected-slot="!!selectedSlot"
          :countdown-formatted="countdownFormatted"
          :countdown-expired="isExpired"
          @update:guestFullName="guestValues.guestFullName = $event"
          @update:guestPhone="guestValues.guestPhone = $event"
          @update:guestEmail="guestValues.guestEmail = $event"
          @update:notes="guestValues.notes = $event"
          @touch="(field) => touch(field as 'guestFullName' | 'guestPhone' | 'guestEmail' | 'notes')"
          @submit="book"
        />
      </UiCard>
    </div>
  </ContentFade>
</template>

<style scoped>
.provider-detail-page {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .provider-detail-page {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .provider-detail-page {
    grid-template-columns: 1fr 1.2fr;
    align-items: start;
  }
}

.provider-detail-page__booking {
  order: -1;
}

@media (min-width: 1024px) {
  .provider-detail-page__booking {
    order: 0;
  }
}

.provider-detail-page__calendar,
.provider-detail-page__slots {
  margin-block: var(--space-4);
}

.provider-detail-page__grid {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .provider-detail-page__grid {
    grid-template-columns: 1fr 1.2fr;
  }
}
</style>
