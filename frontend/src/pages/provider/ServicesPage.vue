<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCrudForm } from "@/composables/useCrudForm";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import {
  createProviderServiceSchema,
  updateProviderServiceSchema,
} from "@/schemas/provider.schema";
import {
  createProviderService,
  deleteProviderService,
  getProviderServices,
  updateProviderService,
  type ProviderServiceItem,
} from "@/services/provider.service";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiConfirmDialog from "@/components/ui/UiConfirmDialog.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import ProviderServiceForm from "@/components/forms/provider/ProviderServiceForm.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { formatPersianNumber } from "@/utils/numbers";

const services = ref<ProviderServiceItem[]>([]);
const listLoading = ref(true);
const listError = ref("");
const deletingIds = ref(new Set<string>());

const {
  open: confirmOpen,
  title: confirmTitle,
  message: confirmMessage,
  confirm: showConfirm,
  onConfirm,
  onCancel,
} = useConfirmDialog();

const initialValues = { name: "", duration: 30, price: 0, description: "" };

const {
  isOpen,
  mode,
  formError,
  modalTitle,
  formLoading,
  values,
  fieldError,
  touch,
  submitting,
  openCreate,
  openEdit,
  close,
  submit,
} = useCrudForm({
  schemas: { create: createProviderServiceSchema, update: updateProviderServiceSchema },
  initialValues,
  create: (data) =>
    createProviderService({
      name: data.name,
      duration: data.duration,
      price: data.price,
      description: data.description || undefined,
    }),
  update: (id, data) =>
    updateProviderService(id, {
      name: data.name,
      duration: data.duration,
      price: data.price,
    }),
  mapEditValues: (row) => {
    const item = row as unknown as ProviderServiceItem;
    return {
      name: item.service.name,
      duration: item.duration,
      price: Number(item.price),
      description: item.service.description ?? "",
    };
  },
  onSuccess: () => load(),
});

async function load() {
  listLoading.value = true;
  listError.value = "";
  try {
    services.value = await getProviderServices();
  } catch {
    listError.value = "خطا در بارگذاری خدمات";
  } finally {
    listLoading.value = false;
  }
}

async function removeService(item: ProviderServiceItem) {
  const ok = await showConfirm(`حذف «${item.service.name}»؟`, { title: "حذف خدمت" });
  if (!ok) return;

  if (deletingIds.value.has(item.id)) return;
  deletingIds.value.add(item.id);
  listError.value = "";
  try {
    await deleteProviderService(item.id);
    await load();
  } catch {
    listError.value = "خطا در حذف خدمت";
  } finally {
    deletingIds.value.delete(item.id);
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">خدمات من</h1>
      <UiButton @click="openCreate()">افزودن خدمت</UiButton>
    </div>

    <div>
      <p v-if="listError" class="mb-3 text-sm text-red-600">{{ listError }}</p>

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
                  {{ item.duration }} دقیقه · {{ formatPersianNumber(Number(item.price)) }} تومان
                </p>
                <p v-if="item.service.description" class="mt-1 text-sm">{{ item.service.description }}</p>
              </div>
              <div class="flex items-center gap-2">
                <StatusBadge kind="active" :value="item.isActive" />
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

    <UiModal
      v-model:open="isOpen"
      :title="`${modalTitle} خدمت`"
      :closable="!formLoading && !submitting"
    >
      <form @submit.prevent="submit">
        <CrudFormShell
          :loading="formLoading"
          :submitting="submitting"
          :error="formError"
          @submit="submit"
          @cancel="close"
        >
          <ProviderServiceForm
            :mode="mode"
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
          />
        </CrudFormShell>
      </form>
    </UiModal>

    <UiConfirmDialog
      v-model:open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      variant="danger"
      confirm-label="حذف"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>
