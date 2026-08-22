import type { UseFormReturn } from "react-hook-form";

export const handleApiValidationErrors = (
  error: any,
  form: UseFormReturn<any>,
  showToast: any
) => {
  const data = error.response?.data;
  
  // If the backend returns validation errors in the `errors` object
  if (data && data.errors && typeof data.errors === 'object') {
    Object.keys(data.errors).forEach((key) => {
      form.setError(key, {
        type: 'server',
        message: data.errors[key],
      });
    });
    showToast("Please correct the highlighted fields.", "error");
    return true;
  }
  
  // Fallback for general errors
  const message = data?.message || error.message || "Something went wrong. Please try again.";
  showToast(message, "error");
  return false;
};
