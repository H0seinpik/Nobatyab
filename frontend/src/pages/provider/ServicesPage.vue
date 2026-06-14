<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useZodForm } from "@/composables/useZodForm";
import { providerServiceFormSchema } from "@/schemas/provider.schema";
import {
  createProviderService,
  deleteProviderService,
  getProviderServices,
  updateProviderService,
  type ProviderServiceItem,
} from "@/services/provider.service";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import UiModal from "@/components/ui/UiModal.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const services = ref<ProviderServiceItem[]>([]);
const listLoading = ref(true);
const message = ref("");
const error = ref("");
const deletingIds = ref(new Set<string>());
const editOpen = ref(false);
const editing = ref<ProviderServiceItem | null>(null);

const { values, fieldError, touch, submitting, reset, handleSubmit } = useZodForm(
  providerServiceFormSchema,
  { name: "", duration: 30, price: 0, description: "" },
);

const {
  values: editValues,
  fieldError: editFieldError,
  touch: editTouch,
  submitting: editSubmitting,
  validateAll: validateEdit,
  reset: resetEdit,
} = useZodForm(providerServiceFormSchema, { name: "", duration: 30, price: 0, description: "" });

async function load() {
  listLoading.value = true;
  error.value = "";
  try {
    services.value = await getProviderServices();
  } catch {
    error.value = "خطا در بارگذاری خدمات";
  } finally {
    listLoading.value = false;
  }
}

async function addService() {
  error.value = "";
  message.value = "";
  await handleSubmit(async (data) => {
    await createProviderService({
      name: data.name,
      duration: data.duration,
      price: data.price,
      description: data.description || undefined,
    });
    reset({ name: "", duration: 30, price: 0, description: "" });
    message.value = "خدمت اضافه شد";
    await load();
  });
}

function openEdit(item: ProviderServiceItem) {
  editing.value = item;
  resetEdit({
    name: item.service.name,
    duration: item.duration,
    price: Number(item.price),
    description: item.service.description ?? "",
  });
  editOpen.value = true;
}

async function saveEdit() {
  if (!editing.value || !validateEdit()) return;
  editSubmitting.value = true;
  error.value = "";
  try {
    await updateProviderService(editing.value.id, {
      name: editValues.name,
      duration: editValues.duration,
      price: editValues.price,
    });
    editOpen.value = false;
    message.value = "خدمت به‌روزرسانی شد";
    await load();
  } catch {
    error.value = "خطا در ویرایش خدمت";
  } finally {
    editSubmitting.value = false;
  }
}

async function removeService(item: ProviderServiceItem) {
  if (deletingIds.value.has(item.id)) return;
  deletingIds.value.add(item.id);
  error.value = "";
  try {
    await deleteProviderService(item.id);
    message.value = "خدمت حذف شد";
    await load();
  } catch {
    error.value = "خطا در حذف خدمت";
  } finally {
    deletingIds.value.delete(item.id);
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="mb-4 text-2xl font-bold">خدمات من</h1>
      <UiCard class="max-w-lg space-y-4">
        <h2 class="font-semibold">افزودن خدمت</h2>
        <form class="space-y-4" @submit.prevent="addService">
          <UiInput
            v-model="values.name"
            label="نام خدمت"
            required
            :error="fieldError('name')"
            @blur="touch('name')"
          />
          <UiInput
            v-model="values.duration"
            label="مدت (دقیقه)"
            type="number"
            required
            :error="fieldError('duration')"
            @blur="touch('duration')"
          />
          <UiInput
            v-model="values.price"
            label="قیمت (تومان)"
            type="number"
            required
            :error="fieldError('price')"
            @blur="touch('price')"
          />
          <UiInput v-model="values.description" label="توضیحات (اختیاری)" />
          <UiButton type="submit" :loading="submitting" :disabled="submitting">افزودن</UiButton>
        </form>
      </UiCard>
    </div>

    <div>
      <h2 class="mb-4 text-xl font-bold">لیست خدمات</h2>
      <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
      <p v-if="message" class="mb-3 text-sm text-green-600">{{ message }}</p>

      <div v-if="listLoading" class="space-y-3">
        <SkeletonCard v-for="i in 3" :key="i" />
      </div>
      <ContentFade v-else>
        <p v-if="!services.length" class="text-sm text-[var(--color-muted)]">هنوز خدمتی ثبت نشده است.</p>
        <div v-else class="space-y-3">
          <UiCard v-for="item in services" :key="item.id">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-semibold">{{ item.service.name }}</p>
                <p class="mt-1 text-sm text-[var(--color-muted)]">
                  {{ item.duration }} دقیقه · {{ Number(item.price).toLocaleString("fa-IR") }} تومان
                </p>
                <p v-if="item.service.description" class="mt-1 text-sm">{{ item.service.description }}</p>
              </div>
              <div class="flex items-center gap-2">
                <UiBadge>{{ item.isActive ? "فعال" : "غیرفعال" }}</UiBadge>
                <UiButton type="button" variant="secondary" @click="openEdit(item)">
                  ویرایش
                </UiButton>
                <UiButton
                  type="button"
                  variant="ghost"
                  :disabled="deletingIds.has(item.id)"
                  @click="removeService(item)"
                >
                  حذف
                </UiButton>
              </div>
            </div>
          </UiCard>
        </div>
      </ContentFade>
    </div>

    <UiModal v-model:open="editOpen" title="ویرایش خدمت">
      <form class="space-y-4" @submit.prevent="saveEdit">
        <UiInput
          v-model="editValues.name"
          label="نام"
          required
          :error="editFieldError('name')"
          @blur="editTouch('name')"
        />
        <UiInput
          v-model="editValues.duration"
          label="مدت (دقیقه)"
          type="number"
          required
          :error="editFieldError('duration')"
          @blur="editTouch('duration')"
        />
        <UiInput
          v-model="editValues.price"
          label="قیمت"
          type="number"
          required
          :error="editFieldError('price')"
          @blur="editTouch('price')"
        />
        <div class="flex gap-2">
          <UiButton type="submit" :loading="editSubmitting" :disabled="editSubmitting">ذخیره</UiButton>
          <UiButton type="button" variant="secondary" @click="editOpen = false">انصراف</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>
