<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { resolveUploadUrl } from "@/utils/uploadUrl";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const emit = defineEmits<{
  uploaded: [avatarUrl: string | null];
}>();

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
    const user = await auth.uploadAvatar(selectedFile.value);
    success.value = "تصویر پروفایل با موفقیت ذخیره شد";
    selectedFile.value = null;
    revokePreview();
    emit("uploaded", user.avatarUrl);
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
  <div class="avatar-upload">
    <div class="avatar-upload__preview">
      <img v-if="displayUrl" :src="displayUrl" alt="تصویر پروفایل" class="avatar-upload__image" />
      <span v-else>{{ initials }}</span>
    </div>

    <div class="avatar-upload__controls">
      <label class="avatar-upload__field">
        <span class="avatar-upload__label">انتخاب تصویر</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="form-control"
          :disabled="uploading"
          @change="onFileChange"
        />
      </label>

      <div v-if="selectedFile" class="avatar-upload__actions">
        <UiButton :loading="uploading" :disabled="uploading" @click="upload">ذخیره تصویر</UiButton>
        <UiButton variant="secondary" :disabled="uploading" @click="cancelSelection">انصراف</UiButton>
      </div>

      <UiAlert v-if="success" variant="success">{{ success }}</UiAlert>
      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>
    </div>
  </div>
</template>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

@media (min-width: 640px) {
  .avatar-upload {
    flex-direction: row;
    align-items: center;
  }
}

.avatar-upload__preview {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-muted);
}

.avatar-upload__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload__controls {
  flex: 1;
}

.avatar-upload__controls > * + * {
  margin-top: 0.75rem;
}

.avatar-upload__field {
  display: block;
}

.avatar-upload__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.avatar-upload__actions {
  display: flex;
  gap: 0.5rem;
}
</style>
