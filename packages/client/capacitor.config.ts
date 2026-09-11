import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
   appId: "com.fishpondstudio.restitutor",
   appName: "Restitutor",
   webDir: "dist",
   loggingBehavior: "production",
   backgroundColor: "#000000",
   plugins: {
      LiveUpdate: {
         readyTimeout: 30_000,
      },
   },
};

export default config;
