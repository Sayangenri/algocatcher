import { useState } from "react";
import { magic } from "../lib/magic";
import { AlgorandMark } from "./AlgorandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type LoginState = "idle" | "loading" | "success";

export default function Login() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState<string | null>(null);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [error, setError] = useState<string | null>(null);

  /* ---------------- EMAIL OTP LOGIN ---------------- */
  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError(null);
      setLoginState("loading");

      await magic.auth.loginWithEmailOTP({ email });

      const publicAddress = await magic.algorand.getWallet();

      setWallet(publicAddress);
      setLoginState("success");

      setTimeout(() => {
        window.location.replace(`/?wallet=${publicAddress}`);
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setLoginState("idle");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoginState("loading");

      await magic.oauth2.loginWithRedirect({
        provider: "google",
        redirectURI: window.location.origin + "/callback",
      });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed.");
      setLoginState("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-body">
      <div className="w-full max-w-sm bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] overflow-hidden">

        {/* Header */}
        <div className="bg-black px-8 pt-8 pb-6 flex flex-col items-center gap-3">
          <AlgorandMark size={48} color="white" />
          <h1 className="font-display text-3xl font-bold text-white tracking-tight text-center leading-tight">
            ALGO Catcher
          </h1>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-5">

          {loginState === "success" && wallet ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
              <p className="font-display text-xl font-bold">
                Logged in!
              </p>

              <div className="bg-black/5 border border-black/10 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Your Algorand Wallet:
                </p>
                <p className="font-mono text-xs break-all">
                  {wallet}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to game…
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className="font-display text-xl font-semibold">
                  Sign in to play
                </p>
                <p className="text-muted-foreground text-sm">
                  Login with email OTP or Google
                </p>
              </div>

              {/* Email Login */}
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loginState === "loading"}
                    className="pl-9 rounded-xl"
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive font-medium ml-1">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={loginState === "loading"}
                  className="w-full rounded-xl bg-black text-white h-11"
                >
                  {loginState === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-black/10" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-black/10" />
              </div>

              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loginState === "loading"}
                variant="outline"
                className="w-full rounded-xl h-11 border-black"
              >
                Continue with Google
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black/10 px-8 py-4 flex items-center justify-center bg-black/[0.02]">
          <AlgorandMark size={14} color="#666" />
        </div>
      </div>
    </div>
  );
}