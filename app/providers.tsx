"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { State, WagmiProvider } from "wagmi";
import { getConfig } from "./wagmi.config";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import { SnackbarProvider } from "notistack";

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: State | undefined;
}) {
  // 使用 useState 來確保 QueryClient 只初始化一次
  const [queryClient] = useState(() => new QueryClient());

  return (
    /* 先提供 React Query 環境，確保其他 Provider 能使用 API */
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        {/* Wagmi 依賴 React Query，因此放在 QueryClientProvider 內 */}
        <WagmiProvider config={getConfig()} initialState={initialState}>
          {/* OnchainKit 需要 Wagmi 提供的鏈上連線資訊，因此放在 WagmiProvider 內 */}
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </WagmiProvider>
      </SnackbarProvider>ß
    </QueryClientProvider>
  );
}
