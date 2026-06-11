<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { createCategoryFormSchema } from "@/schemas/admin.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const categories = ref<Category[]>([]);

const { values, fieldError, touch, isValid, submitting, handleSubmit, reset } = useZodForm(
  createCategoryFormSchema,
  { name: "", slug: "" },
);

async function load() {
  const res = await apiGet<Category[]>("/admin/categories");
  categories.value = res.data;
}

async function create() {
  await handleSubmit(async (data) => {
    await apiPost("/admin/categories", data);
    reset();
    await load();
  });
}

async function toggleActive(cat: Category & { isActive?: boolean }) {
  await apiPatch(`/admin/categories/${cat.id}`, { isActive: !cat.isActive });
  await load();
}

async function remove(id: string) {
  await apiDelete(`/admin/categories/${id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">دسته‌بندی‌ها</h1>
    <UiCard class="mb-6 max-w-lg space-y-3">
      <form class="space-y-3" @submit.prevent="create">
        <UiInput
          v-model="values.name"
          label="نام"
          required
          :error="fieldError('name')"
          @blur="touch('name')"
        />
        <UiInput
          v-model="values.slug"
          label="slug (english)"
          required
          placeholder="health-services"
          :error="fieldError('slug')"
          @blur="touch('slug')"
        />
        <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting">
          افزودن
        </UiButton>
      </form>
    </UiCard>
    <div class="space-y-2">
      <UiCard v-for="cat in categories" :key="cat.id" class="flex items-center justify-between">
        <span>{{ cat.name }} ({{ cat.slug }})</span>
        <div class="flex gap-2">
          <UiButton variant="secondary" @click="toggleActive(cat as Category & { isActive: boolean })">
            فعال/غیرفعال
          </UiButton>
          <UiButton variant="danger" @click="remove(cat.id)">حذف</UiButton>
        </div>
      </UiCard>
    </div>
  </div>
</template>
