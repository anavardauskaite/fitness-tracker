"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Navigation } from "./components/Navigation";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { BodyTracker } from "./components/BodyTracker";
import { Progress } from "./components/Progress";
import { RunningTracker } from "./components/RunningTracker";

type Tab = "workouts" | "running" | "body" | "progress";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0f0f12] text-white overflow-hidden">
      {/* Ambient gradient blob */}
      <div className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
      <div className="relative z-10">
        <Authenticated>
          <MainApp />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("workouts");
  const { signOut } = useAuthActions();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Fitness Tracker</h1>
        </div>
        <button
          onClick={() => void signOut()}
          className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
        >
          Sign out
        </button>
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "workouts" && <WorkoutTracker />}
      {activeTab === "running" && <RunningTracker />}
      {activeTab === "body" && <BodyTracker />}
      {activeTab === "progress" && <Progress />}
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, password, flow });
    } catch {
      setError(
        flow === "signIn"
          ? "Invalid email or password"
          : "Could not create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-xl shadow-violet-600/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-white">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
          Fitness Tracker
        </h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">
          {flow === "signIn" ? "Welcome back" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading
              ? "..."
              : flow === "signIn"
                ? "Sign In"
                : "Sign Up"}
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setError("");
            }}
            className="text-violet-400 hover:text-violet-300"
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
