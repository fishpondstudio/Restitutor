import React from "react";

export function html(
   html: string | null | undefined,
   {
      className,
      style,
      element = "div",
   }: { className?: string; style?: React.CSSProperties; element?: React.HTMLElementType } = {},
): React.ReactNode {
   if (!html) {
      return null;
   }
   return React.createElement(element, { className, style, dangerouslySetInnerHTML: { __html: html } });
}
