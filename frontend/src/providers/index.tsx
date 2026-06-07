import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { queryClient } from "@/lib/queryClient";

const ThemeInit = () => {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  }, []);
  return null;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeInit />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
          toastStyle={{ borderRadius: "10px", fontSize: "0.84rem", fontFamily: "'DM Sans', sans-serif" }}
        />
        {children}
      </QueryClientProvider>
    </React.StrictMode>
  );
};
