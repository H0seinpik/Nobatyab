import axios from "axios";

export interface ExtractedApiError {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
  message?: string;
  errors?: string[] | Record<string, string[]>;
};

function firstFieldError(fieldErrors: Record<string, string[]> | undefined): string | undefined {
  if (!fieldErrors) return undefined;
  for (const messages of Object.values(fieldErrors)) {
    const first = messages?.[0];
    if (first) return first;
  }
  return undefined;
}

function normalizeErrorsArray(errors: string[] | Record<string, string[]> | undefined): string | undefined {
  if (!errors) return undefined;
  if (Array.isArray(errors)) return errors[0];
  return firstFieldError(errors);
}

export function extractApiError(error: unknown, fallback = "عملیات ناموفق بود"): ExtractedApiError {
  if (!axios.isAxiosError(error)) {
    return { message: fallback };
  }

  const data = error.response?.data as ErrorBody | undefined;
  if (!data) {
    return { message: fallback };
  }

  const envelope = data.error;
  const fieldErrors = envelope?.details?.fieldErrors;
  const formErrors = envelope?.details?.formErrors;
  const code = envelope?.code;

  const fieldMessage = firstFieldError(fieldErrors);
  const formMessage = formErrors?.[0];
  const topLevelMessage = typeof data.message === "string" ? data.message : undefined;
  const errorsMessage = normalizeErrorsArray(data.errors);
  const envelopeMessage = envelope?.message;

  const message =
    fieldMessage ??
    formMessage ??
    envelopeMessage ??
    topLevelMessage ??
    errorsMessage ??
    fallback;

  return {
    message,
    code,
    fieldErrors,
  };
}

export function getApiErrorMessage(error: unknown, fallback = "عملیات ناموفق بود"): string {
  return extractApiError(error, fallback).message;
}
