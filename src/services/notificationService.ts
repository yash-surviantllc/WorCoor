import { toast } from "sonner";

export const notification = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),
  error: (message: string, description?: string) =>
    toast.error(message, { description }),
  info: (message: string, description?: string) =>
    toast(message, { description }), // neutral
  warning: (message: string, description?: string) =>
    toast.warning ? toast.warning(message, { description }) : toast(message, { description }),

  custom: (message: string, options?: Parameters<typeof toast>[1]) =>
    toast(message, options),
};
