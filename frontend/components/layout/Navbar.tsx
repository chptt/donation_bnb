"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { shortenAddress } from "@/lib/utils";
import { Zap, Menu, X, ChevronDown, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { address, isConnected, connecting, connect, disconnect, isCorrectNetwork } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400">
              <Zap className="h-5 w-5 text-gray-900" />
            </div>
            <span>Chain<span className="text-yellow-400">Give</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "creator" && (
              <Link
                href="/campaigns/create"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/campaigns/create"
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                )}
              >
                Create Campaign
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wallet button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {!isCorrectNetwork && (
                  <span className="text-xs text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                    Wrong Network
                  </span>
                )}
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {shortenAddress(address!)}
                </button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={connect} loading={connecting}>
                Connect Wallet
              </Button>
            )}

            {/* No login/signup — wallet connect is the only auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-800 bg-gray-900 shadow-xl py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setProfileOpen(false)}>
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user?.role === "creator" && (
            <Link href="/campaigns/create" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setMobileOpen(false)}>
              Create Campaign
            </Link>
          )}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {shortenAddress(address!)}
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={connect} loading={connecting} className="w-full">
                Connect Wallet
              </Button>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/profile" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileOpen(false)}>Profile</Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
