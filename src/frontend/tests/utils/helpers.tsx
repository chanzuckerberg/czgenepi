import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

export const ReactQueryWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
