import type { MantineColor } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export type AlertType = "error" | "warning" | "info" | "success";
function showAlert(message: React.ReactNode, type: AlertType, silent: boolean): void {
   if (!silent) {
      let color: MantineColor;
      switch (type) {
         case "info":
            color = "blue";
            break;
         case "success":
            color = "green";
            break;
         case "warning":
            color = "yellow";
            break;
         case "error":
            color = "red";
            break;
         default:
            color = "blue";
            break;
      }

      notifications.show({
         message,
         position: "top-center",
         color,
         withBorder: true,
         autoClose: 10_000,
      });
   }
}

export function showInfo(message: React.ReactNode, silent = false): void {
   showAlert(message, "info", silent);
}

export function showSuccess(message: React.ReactNode, silent = false): void {
   showAlert(message, "success", silent);
}

export function showWarning(message: React.ReactNode, silent = false): void {
   showAlert(message, "warning", silent);
}

export function showError(message: React.ReactNode, silent = false): void {
   showAlert(message, "error", silent);
}
