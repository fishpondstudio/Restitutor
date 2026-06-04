import { LoadingOverlay } from "@mantine/core";
import { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../../utils/Hook";

const _SetLoading = new TypedEvent<boolean>();
let _isLoading = true;

export function isLoading(): boolean {
   return _isLoading;
}

export function showLoading(): void {
   _isLoading = true;
   _SetLoading.emit(_isLoading);
}

export function hideLoading(): void {
   _isLoading = false;
   _SetLoading.emit(_isLoading);
}

export function LoadingComp(): React.ReactNode {
   const [visible, setVisible] = useState(_isLoading);
   useTypedEvent(_SetLoading, (visible) => {
      setVisible(visible);
   });
   return (
      <LoadingOverlay
         visible={visible}
         loaderProps={{ color: "dark.5", size: "xl" }}
         overlayProps={{ blur: 2, backgroundOpacity: 0.85, color: "#000" }}
      />
   );
}
