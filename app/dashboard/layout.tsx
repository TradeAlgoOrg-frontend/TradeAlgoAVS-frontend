// app/dashboard/layout.tsx
"use client";

import Sidebar from "../components/Sidebar"; // 左側選單
import {
  BellIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "My Strategy",
    href: "/dashboard/strategy",
    icon: PresentationChartBarIcon,
    current: true,
  },
  {
    name: "Subscription",
    href: "/dashboard/team",
    icon: BellIcon,
    current: false,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: ChartPieIcon,
    current: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar navigation={navigation} />
      <div className="flex-1 lg:pl-64 p-6">{children}</div>
    </div>
  );
}
