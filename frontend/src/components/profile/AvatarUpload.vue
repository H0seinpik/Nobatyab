<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { resolveUploadUrl } from "@/utils/uploadUrl";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const auth = useAuthStore();

const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const error = ref("");
const success = ref("");

const displayUrl = computed(() => {
  if (previewUrl.value) return previewUrl.value;
  return resolveUploadUrl(auth.user?.avatarUrl);
});

const initials = computed(() => {
  const name = auth.user?.fullName?.trim();
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
});

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

function onFileChange(event: Event) {
  error.value = "";
  success.value = "";
  revokePreview();
  selectedFile.value = null;

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!ALLOWED_TYPES.has(file.type)) {
    error.value = "فقط تصاویر JPEG، PNG و WebP مجاز هستند";
    input.value = "";
    return;
  }
  if (file.size > MAX_SIZE_BYTES) {
    error.value = "حداکثر حجم فایل ۲ مگابایت است";
    input.value = "";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function upload() {
  if (!selectedFile.value) return;
  error.value = "";
  success.value = "";
  uploading.value = true;
  try {
    await auth.uploadAvatar(selectedFile.value);
    success.value = "تصویر پروفایل با موفقیت ذخیره شد";
    selectedFile.value = null;
    revokePreview();
  } catch {
    error.value = auth.error ?? "آپلود تصویر ناموفق بود";
  } finally {
    uploading.value = false;
  }
}

function cancelSelection() {
  selectedFile.value = null;
  revokePreview();
  error.value = "";
}

onUnmounted(revokePreview);
</script>

<template>
  <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
    <div
      class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-2xl font-semibold text-[var(--color-muted)]"
    >
      <img v-if="displayUrl" :src="displayUrl" alt="تصویر پروفایل" class="h-full w-full object-cover" />
      <span v-else>{{ initials }}</span>
    </div>

    <div class="flex-1 space-y-3">
      <label class="block">
        <span class="mb-1 block text-sm text-[var(--color-muted)]">انتخاب تصویر</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="form-control"
          :disabled="uploading"
          @change="onFileChange"
        />
      </label>

      <div v-if="selectedFile" class="flex gap-2">
        <UiButton :loading="uploading" :disabled="uploading" @click="upload">ذخیره تصویر</UiButton>
        <UiButton variant="secondary" :disabled="uploading" @click="cancelSelection">انصراف</UiButton>
      </div>

      <UiAlert v-if="success" variant="success">{{ success }}</UiAlert>
      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>
    </div>
  </div>
</template>
