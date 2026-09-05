import type { MantineColor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { playSound } from "../../ui/Sound";

export type AlertType = "error" | "warning" | "info" | "success";
function showAlert(message: React.ReactNode, type: AlertType): void {
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
      classNames: {
         description: "text-md",
      },
      autoClose: 10_000,
   });
}

export function showInfo(message: React.ReactNode): void {
   showAlert(message, "info");
}

export function showSuccess(message: React.ReactNode): void {
   showAlert(message, "success");
}

export function showWarning(message: React.ReactNode): void {
   showAlert(message, "warning");
}

export function showError(message: React.ReactNode): void {
   playSound("error");
   showAlert(message, "error");
}
