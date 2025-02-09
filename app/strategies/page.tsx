"use client";
import Link from "next/link";
import { useTradingAlgo } from "../hooks/useTradingAlgo";
import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { useAccount } from "wagmi";
import { Tooltip } from "@mui/material";

const strategies = [
  {
    id: 1,
    name: "Golden Cross Strategy",
    owner: "Alice Smith",
    ownerId: "alice123",
    monthlyReturn: 30.5,
    subscribers: 0,
    totalSubscribers: 0,
    winRate: 78,
    riskScore: 7.8,
    fee: 19,
    status: "High Profit",
  },
  {
    id: 3,
    name: "AI Trend Prediction",
    owner: "Charlie Lee",
    ownerId: "charlie789",
    monthlyReturn: 1.8,
    subscribers: 1190,
    totalSubscribers: 1200,
    winRate: 89,
    riskScore: 2.3,
    fee: 299,
    status: "Hot",
  },
  {
    id: 2,
    name: "Momentum Scalping",
    owner: "Bob Johnson",
    ownerId: "bob456",
    monthlyReturn: -4.2,
    subscribers: 23,
    totalSubscribers: 850,
    winRate: 42,
    riskScore: 9.1,
    fee: 99,
    status: "High Risk",
  },
];

export default function StrategiesPage() {
  const { address, isConnected } = useAccount();
  const { subscribeToStrategy, unsubscribeFromStrategy, getEthPrice, getUserSubscriptions, getActiveSubscribersCount, getTotalSubscribersCount } = useTradingAlgo();
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [subscribedStrategies, setSubscribedStrategies] = useState<number[]>([]);
  const [subscriberCounts, setSubscriberCounts] = useState<{ [key: number]: { active: number; total: number } }>({});

  // Fetch user's subscribed strategies
  useEffect(() => {
    if (isConnected && address) {
      getUserSubscriptions(address).then((subscriptions) => {
        setSubscribedStrategies(subscriptions.map(Number)); // Convert BigInt to number
      });
      async function fetchSubscriberCounts() {
        const counts: { [key: number]: { active: number; total: number } } = {};
        for (const strategy of strategies) {
          const active = await getActiveSubscribersCount(strategy.id);
          const total = await getTotalSubscribersCount(strategy.id);
          counts[strategy.id] = { active, total };
        }
        setSubscriberCounts(counts);
      }
      fetchSubscriberCounts();
    }
  }, [isConnected, address]);

  // Function to subscribe to a strategy
  const handleSubscribe = async (strategyId: number, fee: number) => {
    if (!window.ethereum) {
      alert("Please connect wallet to continue.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [strategyId]: true }));

      // Convert fee from USD to ETH
      const ethPrice = await getEthPrice();
      if (!ethPrice) {
        enqueueSnackbar("Failed to fetch ETH price. Try again later.");
        return;
      }

      const ethValue = parseFloat((fee / ethPrice).toFixed(8));
      console.log(`Subscription fee in ETH: ${ethValue}`);

      await subscribeToStrategy(strategyId, ethValue);
      enqueueSnackbar("Subscription successful!");

      // Update the subscribed strategies list
      setSubscribedStrategies((prev) => [...prev, strategyId]);
    } catch (error) {
      console.error("Subscription failed:", error);
      enqueueSnackbar("Subscription failed. Check the console for details.");
    } finally {
      setLoading((prev) => ({ ...prev, [strategyId]: false }));
    }
  };

  // Function to unsubscribe from a strategy
  const handleUnsubscribe = async (strategyId: number) => {
    if (!window.ethereum) {
      alert("Please connect wallet to continue.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [strategyId]: true }));

      await unsubscribeFromStrategy(strategyId);
      enqueueSnackbar("Unsubscription successful!");

      // Update the subscribed strategies list
      setSubscribedStrategies((prev) => prev.filter((id) => id !== strategyId));
    } catch (error) {
      console.error("Unsubscription failed:", error);
      enqueueSnackbar("Unsubscription failed. Check the console for details.");
    } finally {
      setLoading((prev) => ({ ...prev, [strategyId]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Top Trading Strategies</h1>
          <p className="text-gray-600 text-xl">
            Discover high-performing trading strategies from expert providers
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-10 flex gap-4 flex-wrap">
          <select className="bg-white px-4 py-2 rounded-lg border">
            <option>Sort by Return</option>
            <option>Sort by Popularity</option>
            <option>Sort by Risk</option>
          </select>
          <input
            type="text"
            placeholder="Search by strategy owner..."
            className="bg-white px-4 py-2 rounded-lg border flex-1 min-w-[300px]"
          />
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {strategy.name}
                    </h3>
                    <Link
                      href={`/user/${strategy.ownerId}`}
                      className="text-gray-600 hover:text-indigo-600"
                    >
                      By {strategy.owner}
                    </Link>
                  </div>
                  <span
                    className={classNames(
                      strategy.status === "High Profit"
                        ? "bg-green-100 text-green-800"
                        : strategy.status === "High Risk"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800",
                      "text-sm font-medium px-3 py-1 rounded-full"
                    )}
                  >
                    {strategy.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Tooltip title="Return on Investment" arrow>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Monthly Return</p>
                    <p
                      className={`text-2xl font-bold ${strategy.monthlyReturn < 0
                        ? "text-red-600"
                        : "text-green-600"
                        }`}
                    >
                      {strategy.monthlyReturn}%
                    </p>
                  </div>
                  </Tooltip>
                  <Tooltip title="Current / Total" arrow>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500"> Subscribers</p>
                      <p className="text-2xl font-bold">
                        {(strategy.subscribers + (subscriberCounts[strategy.id]?.active || 0)).toLocaleString()}
                        <span className="text-gray-400"> / </span>
                        {(strategy.totalSubscribers + (subscriberCounts[strategy.id]?.total || 0)).toLocaleString()}
                      </p>
                    </div>
                  </Tooltip>
                  <Tooltip title="Profitability" arrow>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-2xl font-bold">{strategy.winRate}%</p>
                  </div>
                  </Tooltip>
                  <Tooltip title="Risk and Drawbacks" arrow>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Risk Score</p>
                    <p
                      className={`text-2xl font-bold ${strategy.riskScore >= 7 ? "text-red-600" : ""
                        }`}
                    >
                      {strategy.riskScore}
                    </p>
                  </div>
                  </Tooltip>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Subscription Fee</p>
                    <p className="text-2xl font-bold">
                      ${strategy.fee}{" "}
                      <span className="text-sm text-gray-500">/ month</span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      subscribedStrategies.includes(strategy.id)
                        ? handleUnsubscribe(strategy.id)
                        : handleSubscribe(strategy.id, strategy.fee)
                    }
                    className={`px-6 py-2 rounded-lg ${subscribedStrategies.includes(strategy.id)
                      ? "bg-red-600 text-white hover:bg-red-800"
                      : "bg-black text-white hover:bg-gray-800"
                      }`}
                    disabled={loading[strategy.id]}
                  >
                    {loading[strategy.id]
                      ? "Processing..."
                      : subscribedStrategies.includes(strategy.id)
                        ? "Unsubscribe"
                        : "Subscribe"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
