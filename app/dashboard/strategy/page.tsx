"use client";
import StrategyCard from "../../components/StrategyCard";
import { useTradingAlgo } from "../../hooks/useTradingAlgo";
import { useEffect, useState } from "react";

type Strategy = {
  id: number;
  uid: string;
  owner: string;
  name: string;
  subscriptionFee: number;
  subscriberCount: number;
  subscriptionPeriod: string;
  profitability: number;
  risk: number;
  ROI: number;
  status: string;
};

const mockStrategies = [
  {
    id: 2000,
    uid: "d732e251-da78-44ef-88ec-31b5729f859a",
    owner: "0x123456789abcdef123456789abcdef1234567890",
    name: "Breakout Strategy",
    subscriptionFee: 25,
    subscriberCount: 500,
    subscriptionPeriod: "month",
    profitability: 18.7,
    risk: 3.2,
    ROI: 7.5,
    status: "Stable",
  },
  {
    id: 2001,
    uid: "e8d7e251-da78-44ef-88ec-31b5729f859b",
    owner: "0xabcdef123456789abcdef123456789abcdef1234",
    name: "EMA Crossover",
    subscriptionFee: 12,
    subscriberCount: 320,
    subscriptionPeriod: "week",
    profitability: 12.3,
    risk: 4.5,
    ROI: 6.2,
    status: "Moderate",
  },
];

export default function MyStrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [loading, setLoading] = useState<boolean>(true);
  const { getMyStrategies, isContractReady } = useTradingAlgo();

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        if (isContractReady) {
          const result = await getMyStrategies();
          console.log("Fetched my strategies:", result);

          setStrategies((prev) => {
            // 確保不會重複添加相同的策略
            const mergedStrategies = [...prev, ...result].filter(
              (value, index, self) =>
                index === self.findIndex((s) => s.uid === value.uid)
            );

            return mergedStrategies;
          });
        }
      } catch (error) {
        console.error("Failed to fetch my strategies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [isContractReady, getMyStrategies]);

  const handleSubscribe = (id: number) => {
    console.log(`Subscribing to strategy ${id}`);
  };

  if (!isContractReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          Initializing contract...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">My Trading Strategies</h1>
          <p className="text-gray-600 text-xl">
            View and manage your own trading strategies.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading strategies...</div>
        ) : strategies.length === 0 ? (
          <div className="text-center text-gray-500">No strategies found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.uid}
                strategy={strategy}
                onSubscribe={handleSubscribe}
                editable={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}