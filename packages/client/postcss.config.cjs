const customCursors = {
   postcssPlugin: "custom-cursors",
   Declaration(decl) {
      const isCursorProperty = decl.prop === "cursor" || (decl.prop.startsWith("--") && decl.prop.includes("cursor"));
      if (!isCursorProperty) {
         return;
      }
      if (decl.value === "pointer") {
         decl.value = "var(--hand-cursor)";
      } else if (decl.value === "default") {
         decl.value = "var(--default-cursor)";
      } else if (decl.value === "not-allowed") {
         decl.value = "var(--not-allowed-cursor)";
      }
   },
};

module.exports = {
   plugins: [
      require("postcss-preset-mantine"),
      require("postcss-simple-vars")({
         variables: {
            "mantine-breakpoint-xs": "36em",
            "mantine-breakpoint-sm": "48em",
            "mantine-breakpoint-md": "62em",
            "mantine-breakpoint-lg": "75em",
            "mantine-breakpoint-xl": "88em",
         },
      }),
      customCursors,
   ],
};
