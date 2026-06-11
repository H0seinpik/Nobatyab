import { defineStore } from "pinia";
import { ref } from "vue";
import { apiGet } from "@/services/api";

export type PublicSettings = Record<string, string>;

export const useSettingsStore = defineStore("settings", () => {
  const publicSettings = ref<PublicSettings>({});
  const loaded = ref(false);

  async function fetchPublic() {
    try {
      const res = await apiGet<PublicSettings>("/settings/public", undefined, {
        skipGlobalLoading: true,
      });
      publicSettings.value = res.data;
    } catch {
      publicSettings.value = {};
    } finally {
      loaded.value = true;
    }
  }

  function get(key: string, fallback = "") {
    return publicSettings.value[key] ?? fallback;
  }

  return { publicSettings, loaded, fetchPublic, get };
});
