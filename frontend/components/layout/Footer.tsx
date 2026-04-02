import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-400">
              <Zap className="h-4 w-4 text-gray-900" />
            </div>
            <span className="font-bold text-white">Chain<span className="text-yellow-400">Give</span></span>
            <span className="text-gray-600 text-sm ml-2">Powered by BNB Chain</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/explore" className="hover:text-gray-300 transition-colors">Explore</Link>
            <Link href="/leaderboard" className="hover:text-gray-300 transition-colors">Leaderboard</Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-gray-600">© 2024 ChainGive. Built on BNB Testnet.</p>
        </div>
      </div>
    </footer>
  );
}
