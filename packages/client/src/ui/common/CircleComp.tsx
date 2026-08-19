import type { DefaultMantineColor } from "@mantine/core";
import type { ComponentPropsWithRef } from "react";

type CircleCompProps = Omit<ComponentPropsWithRef<"div">, "color"> & {
   color: DefaultMantineColor;
   size?: string;
};

export function CircleComp({ color, size = "0.875rem", ref, style, ...props }: CircleCompProps): React.ReactNode {
   return (
      <div
         {...props}
         ref={ref}
         style={{
            ...style,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(to bottom, var(--mantine-color-${color}-4), var(--mantine-color-${color}-7))`,
         }}
      />
   );
}
