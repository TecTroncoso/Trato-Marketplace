"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "0.6rem",
          fontFamily: "inherit",
        },
      }}
    />
  );
}
