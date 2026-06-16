import { isAdmin } from "../../rpc/HandleMessage";
import { isDev } from "../../utils/Global";

const _forceProd = false;

export function DevOnly({ children }: { children: React.ReactNode }) {
   if (_forceProd) {
      return null;
   }
   if (isDev()) {
      return children;
   }
   return null;
}

export function DevOrAdminOnly({ children }: { children: React.ReactNode }) {
   if (_forceProd) {
      return null;
   }
   if (isDev() || isAdmin()) {
      return children;
   }
   return null;
}
