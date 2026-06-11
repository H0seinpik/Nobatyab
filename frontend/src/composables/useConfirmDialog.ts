import { ref } from "vue";

export function useConfirmDialog() {
  const open = ref(false);
  const message = ref("");
  const title = ref("تأیید");
  const loading = ref(false);
  let resolveFn: ((value: boolean) => void) | null = null;

  function confirm(msg: string, opts?: { title?: string }) {
    message.value = msg;
    title.value = opts?.title ?? "تأیید";
    open.value = true;
    loading.value = false;
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve;
    });
  }

  function onConfirm() {
    resolveFn?.(true);
    resolveFn = null;
    open.value = false;
    loading.value = false;
  }

  function onCancel() {
    resolveFn?.(false);
    resolveFn = null;
    open.value = false;
    loading.value = false;
  }

  return { open, message, title, loading, confirm, onConfirm, onCancel };
}
