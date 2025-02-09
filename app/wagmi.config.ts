// wagmi.config.ts
import { createConfig, http } from "wagmi";
import { base, baseSepolia, sepolia, Chain, holesky } from "wagmi/chains";
import { coinbaseWallet, metaMask } from "wagmi/connectors";

const isTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";

// 顯式告訴 TypeScript `chains` 的類型
// const chains: readonly [Chain, ...Chain[]] = isTestnet ? [holesky] : [base];

export const getConfig = () =>
  createConfig({
    chains: [base, holesky, sepolia, baseSepolia],
    connectors: [
      // coinbaseWallet({
      //   appName: "hackathon",
      // }),
      metaMask(),
    ],
    transports: {
      [base.id]: http(),
      [holesky.id]: http(),
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });
