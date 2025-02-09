"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import tradingAlgoArtifact from "../abis/TradingAlgoAVS.json";
const tradingAlgoABI = tradingAlgoArtifact.abi;
import { useAccount } from "wagmi";
import axios from "axios";
import { parse } from "path";

const CONTRACT_ADDRESS = "0xF8EDE4500F5cDcFd4FB6F584Ea5DcA63D72De79f";

export function useTradingAlgo() {
  const { address, isConnected } = useAccount();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  // ✅ Initialize Provider & Contract
  useEffect(() => {
    if (typeof window !== "undefined" && isConnected && window.ethereum) {
      const _provider = new BrowserProvider(window.ethereum);
      setProvider(_provider);
      _provider.getSigner().then((signer) => {
        const _contract = new Contract(
          CONTRACT_ADDRESS,
          tradingAlgoABI,
          signer
        );
        setContract(_contract);
      });
    }
  }, [isConnected]);

  // ✅ Upload Strategy to Backend
  const uploadStrategy = async (file: File): Promise<string | null> => {
    try {
      // const formData = new FormData();
      // formData.append("strategy", file);

      // const res = await fetch("/api/upload-strategy", {
      //   method: "POST",
      //   body: formData,
      // });

      // if (!res.ok) {
      //   throw new Error("Failed to upload strategy");
      // }

      // const data = await res.json();
      return "123"; // Fake strategy_uid for demo
      // return data.strategy_uid;
    } catch (error) {
      console.error("❌ Error uploading strategy:", error);
      return null;
    }
  };

  // ✅ Create Strategy on Blockchain
  const createStrategy = async (
    strategyUid: string,
    subscriptionFee: number,
    subscriptionPeriod: string,
    roi: number,
    profitability: number,
    risk: number
  ) => {
    if (!contract) {
      console.error("❌ No contract found!");
      return;
    }

    try {
      const feeInWei = parseEther(subscriptionFee.toString());

      const tx = await contract.createStrategy(
        strategyUid,
        feeInWei,
        subscriptionPeriod,
        roi,
        profitability,
        risk
      );

      await tx.wait();
      console.log("✅ Strategy Created on Blockchain!");
    } catch (error) {
      console.error("❌ Error creating strategy:", error);
    }
  };

  // ✅ Get All Strategies
  const getAllStrategies = async () => {
    if (!contract) {
      console.error("❌ No contract found!");
      return [];
    }

    try {
      const strategies = await contract.getAllStrategies();
      return strategies.map(
        (s: {
          id: number;
          provider: string;
          subscriptionFee: number;
          subscriptionPeriod: string;
          strategyUid: string;
          roi: number;
          profitability: number;
          risk: number;
          active: boolean;
        }) => ({
          id: s.id.toString(),
          provider: s.provider,
          subscriptionFee: s.subscriptionFee.toString(),
          subscriptionPeriod: s.subscriptionPeriod,
          strategyUid: s.strategyUid,
          roi: s.roi.toString(),
          profitability: s.profitability.toString(),
          risk: s.risk.toString(),
          active: s.active,
        })
      );
    } catch (error) {
      console.error("❌ Error fetching strategies:", error);
      return [];
    }
  };

  // ✅ Subscribe to a Strategy
  const subscribeToStrategy = async (strategyId: number, feeInEth: number) => {
    if (!contract) {
      console.error("❌ No contract found!");
      return;
    }

    try {
      const value = parseEther(feeInEth.toString());

      const feeInWei = 1;
    
      console.log(`🔄 Subscribing to strategy ID: ${strategyId} at ${value}`);

      const tx = await contract.subscribeStrategy(strategyId, { feeInWei });
      await tx.wait();
      console.log("✅ Subscription successful!");
      return tx;
    } catch (error) {
      console.error("❌ Error subscribing:", error);
      throw error;
    }
  };

  // ✅ Unsubscribe from a Strategy
  const unsubscribeFromStrategy = async (strategyId: number) => {
    if (!contract) {
      console.error("❌ No contract found!");
      return;
    }

    try {
      console.log(`🔄 Unsubscribing from strategy ID: ${strategyId}`);

      const tx = await contract.unsubscribeStrategy(strategyId);
      await tx.wait();

      console.log("✅ Unsubscription successful!");
    } catch (error) {
      console.error("❌ Error unsubscribing:", error);
    }
  };

  const getEthPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data.ethereum.usd;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return null;
    }
  };

  const getUserSubscriptions = async (walletAddress: string) => {
    if (!contract) {
      console.error("❌ No contract found!");
      return [];
    }
  
    try {
      console.log(`🔄 Fetching subscriptions for: ${walletAddress}`);
  
      const subscriptionIds = await contract.getUserSubscriptions(walletAddress);
      return subscriptionIds.map((id: bigint) => id.toString());
    } catch (error) {
      console.error("❌ Error fetching user subscriptions:", error);
      return [];
    }
  };

  return {
    uploadStrategy,
    createStrategy,
    getAllStrategies,
    subscribeToStrategy,
    unsubscribeFromStrategy,
    getEthPrice,
    getUserSubscriptions,
  };
}
