<script setup lang="ts">
import { ref } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import { submitReview } from "@/services/review.service";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  appointmentId: string;
}>();

const emit = defineEmits<{ submitted: [] }>();

const toast = useToast();
const rating = ref(5);
const comment = ref("");
const submitting = ref(false);

async function submit() {
  submitting.value = true;
  try {
    await submitReview(props.appointmentId, {
      rating: rating.value,
      comment: comment.value || undefined,
    });
    toast.success("نظر شما ثبت شد");
    emit("submitted");
  } catch {
    toast.error("ثبت نظر ناموفق بود");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="review-form" @submit.prevent="submit">
    <p class="review-form__label">امتیاز شما</p>
    <div class="review-form__stars" role="group" aria-label="انتخاب امتیاز">
      <button
        v-for="i in 5"
        :key="i"
        type="button"
        class="review-form__star-btn"
        :class="{ 'review-form__star-btn--active': i <= rating }"
        :aria-label="`${i} ستاره`"
        :aria-pressed="rating === i"
        @click="rating = i"
      >
        ★
      </button>
    </div>
    <UiInput v-model="comment" label="نظر (اختیاری)" placeholder="تجربه خود را بنویسید..." />
    <UiButton type="submit" :loading="submitting">ثبت نظر</UiButton>
  </form>
</template>

<style scoped>
.review-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.review-form__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.review-form__stars {
  display: flex;
  gap: var(--space-1);
}

.review-form__star-btn {
  border: none;
  background: transparent;
  padding: var(--space-1);
  font-size: var(--text-2xl);
  color: var(--color-border);
  cursor: pointer;
  line-height: 1;
}

.review-form__star-btn--active {
  color: #f59e0b;
}

.review-form__star-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
</style>
