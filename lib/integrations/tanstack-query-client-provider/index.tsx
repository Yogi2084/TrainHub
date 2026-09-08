"use client";

import { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { tanstackQueryClient } from "@/lib/integrations/tanstack-query";

const TanstackQueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default TanstackQueryClientProvider;
