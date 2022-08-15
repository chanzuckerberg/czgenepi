import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export const ReactQueryWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);