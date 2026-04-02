import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Zap, Shield, Trophy, TrendingUp, Users, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Shield, title: "Transparent & Trustless", desc: "Every donation is recorded on BNB Chain. No middlemen, no hidden fees." },
  { icon: Zap, title: "Instant Transfers", desc: "Funds go directly to campaign creators via smart contracts." },
  { icon: Trophy, title: "Live Leaderboard", desc: "Top campaigns and donors ranked in real-time based on on-chain activity." },
  { icon: TrendingUp, title: "Track Progress", desc: "Watch campaigns grow with live progress bars and donation history." },
];

const steps = [
  { step: "01", title: "Connect Wallet", desc: "Link your MetaMask wallet to BNB Testnet" },
  { step: "02", title: "Browse Campaigns", desc: "Explore active campaigns across categories" },
  { step: "03", title: "Support Creators", desc: "Send BNB directly to your favorite creators" },
  { step: "04", title: "Track Impact", desc: "See your donations on the leaderboard" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm text-yellow-400 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Powered by opBNB Testnet
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            Fans Support{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Creators
            </span>
            <br />on the Blockchain
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            ChainGive lets fans donate directly to their favorite creators on-chain.
            Every transaction is verifiable. Every campaign is real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="gap-2">
                Explore Campaigns <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Start a Campaign
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { label: "Campaigns", value: "100+" },
              { label: "BNB Raised", value: "500+" },
              { label: "Donors", value: "1K+" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 border-t border-gray-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Why ChainGive?</h2>
            <p className="text-gray-400">Built for transparency, designed for impact</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-gray-700 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 border-t border-gray-800/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Get started in minutes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-full h-px bg-gradient-to-r from-gray-700 to-transparent" />
                )}
                <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-yellow-400/40 bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {s.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 border-t border-gray-800/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make an impact?</h2>
          <p className="text-gray-400 mb-8">Join creators and fans on ChainGive</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/campaigns/create">
              <Button size="lg">Launch a Campaign</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">Browse Campaigns</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
