"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();

  const handlePlanSelect = async (plan: "free" | "premium") => {
    try {
      // Redirect to sign in with the selected plan
      await signIn("google", {
        callbackUrl: `/dashboard?plan=${plan}`,
      });
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <h1 className="mb-16 text-5xl font-bold">Choose Your Plan</h1>
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
        {/* Free Plan Card */}
        <div className="flex flex-col rounded-xl bg-white/20 p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold">Free</h2>
            <p className="text-orange-50">Perfect for getting started</p>
          </div>
          <ul className="mb-8 grid grid-cols-2 gap-4">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Basic market data
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Property search
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Saved properties
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Email notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Basic analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Market trends
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Property comparisons
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Community access
            </li>
          </ul>
          <div className="mt-auto">
            <button
              onClick={() => handlePlanSelect("free")}
              className="block w-full rounded-full bg-white/30 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/50"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Premium Plan Card */}
        <div className="flex flex-col rounded-xl bg-white/20 p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold">Premium</h2>
            <p className="text-orange-50">For serious investors</p>
          </div>
          <ul className="mb-8 grid grid-cols-2 gap-4">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Everything in Free
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Advanced market analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Market predictions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Priority support
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Custom alerts
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              API access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Investment strategies
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Portfolio tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Risk analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Market reports
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Expert consultations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Custom dashboards
            </li>
          </ul>
          <div className="mt-auto">
            <button
              onClick={() => handlePlanSelect("premium")}
              className="block w-full rounded-full bg-white/30 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/50"
            >
              Get Premium
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
