import { FieldErrors, UseFormSetError, Path } from "react-hook-form";
import { AxiosError } from "axios";

export interface ServerErrorResponse {
  error?: string;
  errors?: Record<string, string | string[]>;
  message?: string;
}

/**
 * Maps server errors to form fields
 * @param error - The axios error response
 * @param setError - React Hook Form's setError function
 * @param fieldMap - Optional mapping of server field names to form field names
 * @returns true if errors were mapped to fields, false if it's a general error
 */
export function mapServerErrorsToFields<T extends Record<string, any>>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, keyof T>
): boolean {
  if (!error || typeof error !== "object") return false;

  const axiosError = error as AxiosError<ServerErrorResponse>;
  const response = axiosError.response?.data;

  if (!response) return false;

  let hasFieldErrors = false;

  // Handle field-specific errors
  if (response.errors && typeof response.errors === "object") {
    Object.entries(response.errors).forEach(([field, messages]) => {
      const formField = (fieldMap?.[field] || field) as Path<T>;
      const message = Array.isArray(messages) ? messages[0] : messages;
      
      if (message) {
        setError(formField, {
          type: "server",
          message: message as string,
        });
        hasFieldErrors = true;
      }
    });
  }

  // Handle single error message that might map to a field
  if (response.error && !hasFieldErrors) {
    // Try to extract field name from error message
    const fieldMatch = response.error.match(/(\w+)\s+(is required|must be|should be|invalid)/i);
    if (fieldMatch && fieldMatch[1]) {
      const fieldName = fieldMatch[1].toLowerCase();
      const formField = (fieldMap?.[fieldName] || fieldName) as Path<T>;
      setError(formField, {
        type: "server",
        message: response.error,
      });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}

/**
 * Extracts a user-friendly error message from server error
 */
export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred";
  }

  const axiosError = error as AxiosError<ServerErrorResponse>;
  const response = axiosError.response?.data;

  if (response?.error) {
    return response.error;
  }

  if (response?.message) {
    return response.message;
  }

  if (axiosError.message) {
    // Handle network errors
    if (axiosError.code === "ERR_NETWORK" || axiosError.message.includes("Network Error")) {
      return "Network error. Please check your connection and try again.";
    }
    return axiosError.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Checks if error is a common/general error that should be shown as toast
 */
export function isCommonError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const axiosError = error as AxiosError<ServerErrorResponse>;
  const response = axiosError.response?.data;

  if (!response) return false;

  // Common errors that should be shown as toast
  const commonErrorPatterns = [
    /invalid.*credentials/i,
    /authentication.*required/i,
    /unauthorized/i,
    /forbidden/i,
    /not found/i,
    /network error/i,
    /server error/i,
    /internal error/i,
  ];

  const errorMessage = response.error || response.message || "";
  return commonErrorPatterns.some((pattern) => pattern.test(errorMessage));
}



