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
    <div className="min-h-screen bg-zinc-900 text-white">
      <Authenticated>
        <MainApp />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
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
        <h1 className="text-xl font-bold text-white">Fitness Tracker</h1>
        <button
          onClick={() => void signOut()}
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
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
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Fitness Tracker
        </h1>
        <p className="text-zinc-500 text-center mb-8">
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
