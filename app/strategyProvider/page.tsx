"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useAccount } from "wagmi"; // 用來判斷錢包是否已連接
import WalletComponent from "../components/WalletComponent";
import { useTradingAlgo } from "../hooks/useTradingAlgo";
import StatusModal from "../components/StatusModal";
import { useRouter } from "next/navigation";

export default function StrategyProviderForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount(); // 檢查是否已連接錢包
  const [strategyName, setStrategyName] = useState("");
  const { uploadStrategy, createStrategy } = useTradingAlgo();
  const [strategyType, setStrategyType] = useState("python");
  const [file, setFile] = useState<File | null>(null);
  const [subscriptionFee, setsubscriptionFee] = useState("");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState("per month");
  const [isUploading, setIsUploading] = useState(false);
  const [roi, setRoi] = useState<number | string>("");
  const [profitability, setProfitability] = useState<number | string>("");
  const [risk, setRisk] = useState<number | string>("");

  // Modal Status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<"success" | "failed" | null>(
    null
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleUploadAndCreate = async () => {
    if (!file) return alert("Please upload a strategy file");

    setIsUploading(true);

    try {
      // Upload Strategy to the backend and get the strategy UID
      const strategyUid = await uploadStrategy(
        file,
        strategyName,
        address as string,
        strategyType,
        Number(roi),
        Number(profitability),
        Number(risk)
      );

      if (!strategyUid) throw new Error("Strategy upload failed");

      // Create Strategy on the blockchain
      const period =
        subscriptionPeriod === "per day"
          ? "day"
          : subscriptionPeriod === "per week"
          ? "week"
          : "month";

      // const feeInWei = ethers.parseUnits(subscriptionFee, "ether"); // ✅ 這裡轉換

      await createStrategy(
        strategyUid,
        Number(subscriptionFee),
        period,
        Number(roi),
        Number(profitability),
        Number(risk)
      );

      // ✅ 成功時顯示 Modal
      setModalStatus("success");
      setModalTitle("Strategy Created!");
      setModalMessage(
        "Your strategy has been successfully created on the blockchain."
      );
    } catch (error) {
      setModalStatus("failed");
      setModalTitle("Transaction Failed");
      setModalMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the strategy."
      );
    } finally {
      setIsUploading(false);
      setIsModalOpen(true); // 開啟 Modal
    }
  };
  // 拖曳上傳功能
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/dashboard/strategy");
  };

  // **如果沒連接錢包，顯示提示**
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          ⚠️ Please connect your wallet first.
        </p>
        <WalletComponent /> {/* 這裡顯示 Connect Wallet 按鈕 */}
      </div>
    );
  }

  return (
    <form className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Upload Your Trading Strategy
      </h1>

      <div className="space-y-6">
        {/* Strategy Name */}
        <div>
          <label
            htmlFor="strategyName"
            className="block text-sm font-medium text-gray-900"
          >
            Strategy Name
          </label>
          <input
            id="strategyName"
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
            placeholder="Enter strategy name"
          />
        </div>

        {/* Strategy Type */}
        <div>
          <label
            htmlFor="strategyType"
            className="block text-sm font-medium text-gray-900"
          >
            Strategy Type
          </label>
          <div className="mt-2 grid grid-cols-1">
            <select
              id="strategyType"
              value={strategyType}
              onChange={(e) => setStrategyType(e.target.value)}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
            >
              <option value="python">Python</option>
              <option value="pine_script">Pine Script</option>
              <option value="natural_language">Natural Language</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500"
            />
          </div>
        </div>

        {/* Upload File */}
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-900"
          >
            Upload Strategy File
          </label>
          <div
            className="mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 bg-gray-50 hover:bg-gray-100 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <PhotoIcon className="size-12 text-gray-300" />
            <div className="mt-4 flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
            {file && (
              <p className="mt-3 text-sm text-green-600 font-semibold">
                {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Subscription Price */}
        <div>
          <label
            htmlFor="subscriptionFee"
            className="block text-sm font-medium text-gray-900"
          >
            Subscription Price
          </label>
          <div className="mt-2 flex items-center rounded-md bg-white px-3 border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
            <div className="shrink-0 select-none text-base text-gray-500">
              $
            </div>
            <input
              id="subscriptionFee"
              type="text"
              placeholder="0.00"
              value={subscriptionFee}
              onChange={(e) => setsubscriptionFee(e.target.value)}
              className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <div className="shrink-0 select-none text-base text-gray-500">
              USD
            </div>
          </div>
        </div>

        {/* Subscription Period */}
        <div>
          <label
            htmlFor="subscriptionPeriod"
            className="block text-sm font-medium text-gray-900"
          >
            Subscription Period
          </label>
          <div className="mt-2 grid grid-cols-1">
            <select
              id="subscriptionPeriod"
              value={subscriptionPeriod}
              onChange={(e) => setSubscriptionPeriod(e.target.value)}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
            >
              <option value="per day">Per Day</option>
              <option value="per week">Per Week</option>
              <option value="per month">Per Month</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500"
            />
          </div>
        </div>
        {/* Strategy Performance Metrics */}
        <div className="mb-4 text-sm text-gray-600">
          * The following values are optional for now. They will be dynamically
          updated based on real trading performance over time.
        </div>

        {/* ROI (Return on Investment) */}
        <div>
          <label
            htmlFor="ROI"
            className="block text-sm font-medium text-gray-900"
          >
            ROI (Return on Investment)
          </label>
          <input
            id="roi"
            type="number"
            value={roi}
            onChange={(e) => setRoi(Number(e.target.value))}
            className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Profitability */}
        <div>
          <label
            htmlFor="ROI"
            className="block text-sm font-medium text-gray-900"
          >
            Profitability
          </label>
          <input
            id="profitability"
            type="number"
            value={profitability}
            onChange={(e) => setProfitability(Number(e.target.value))}
            className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Risk */}
        <div>
          <label
            htmlFor="ROI"
            className="block text-sm font-medium text-gray-900"
          >
            Risk
          </label>
          <input
            id="profitability"
            type="number"
            value={risk}
            onChange={(e) => setRisk(Number(e.target.value))}
            className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUploadAndCreate}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Create Strategy"}
        </button>
      </div>
      <StatusModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        status={modalStatus!}
        title={modalTitle}
        message={modalMessage}
        buttonText="OK"
      />
    </form>
  );
}
