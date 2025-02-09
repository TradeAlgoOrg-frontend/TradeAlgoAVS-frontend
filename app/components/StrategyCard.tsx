import React from "react";
import Link from "next/link";
import { PencilIcon } from "@heroicons/react/24/outline"; // Import Heroicons

interface Strategy {
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
}

interface StrategyCardProps {
  strategy: Strategy;
  onSubscribe?: (id: number) => void;
  editable?: boolean; // New prop to toggle edit mode
}

// Shorten wallet address (e.g., 0x4D15...A23D)
const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onSubscribe,
  editable = false, // Default to false
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
            <div className="flex items-center gap-2">
              <span>By </span>
              <Link
                href={`/user/${strategy.owner}`}
                className="text-gray-600 hover:text-indigo-600"
              >
                {shortenAddress(strategy.owner)}
              </Link>
            </div>
          </div>

          {/* Status & Edit Icon */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                strategy.status === "High Profit"
                  ? "bg-green-100 text-green-800"
                  : strategy.status === "High Risk"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {strategy.status}
            </span>

            {/* Show pencil only if editable */}
            {editable && (
              <PencilIcon className="w-5 h-5 text-gray-600 hover:text-indigo-600 cursor-pointer" />
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">ROI</p>
            <p
              className={`text-2xl font-bold ${
                strategy.ROI < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {strategy.ROI}%
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Profitability</p>
            <p
              className={`text-2xl font-bold ${
                strategy.profitability < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {strategy.profitability}%
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Risk Score</p>
            <p
              className={`text-2xl font-bold ${
                strategy.risk >= 7 ? "text-red-600" : ""
              }`}
            >
              {strategy.risk}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Subscribers</p>
            <p className="text-2xl font-bold">
              {strategy.subscriberCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Subscription Price */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Subscription Fee</p>
            <p className="text-2xl font-bold">
              ${strategy.subscriptionFee}{" "}
              <span className="text-sm text-gray-500">
                / {strategy.subscriptionPeriod}
              </span>
            </p>
          </div>
          {!editable && (
            <button
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              onClick={() => onSubscribe?.(strategy.id)}
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;