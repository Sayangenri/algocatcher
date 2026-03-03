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
  Gamepad2,
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100/50 to-blue-50 relative overflow-hidden font-body">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cloud-like shapes with floating animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-white/15 rounded-full blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-[float_30s_ease-in-out_infinite]" />
        
        {/* Mobile: Smaller cloud shapes */}
        <div className="md:hidden absolute top-10 left-4 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-[float_15s_ease-in-out_infinite]" />
        <div className="md:hidden absolute top-32 right-4 w-56 h-56 bg-white/15 rounded-full blur-2xl animate-[float_18s_ease-in-out_infinite_reverse]" />
        
        {/* Circular lines */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px]">
          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute inset-[50px] md:inset-[100px] border-2 border-white/15 rounded-full animate-[pulse_4s_ease-in-out_infinite_1s]" />
          <div className="absolute inset-[100px] md:inset-[200px] border-2 border-white/10 rounded-full animate-[pulse_4s_ease-in-out_infinite_2s]" />
        </div>
      </div>

      {/* Logo in top-left corner - responsive */}
      <div className="absolute top-3 left-3 xs:top-4 xs:left-4 md:top-6 md:left-6 z-10 flex items-center gap-1.5 xs:gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-black rounded-md xs:rounded-lg md:rounded-xl p-1.5 xs:p-2 md:p-2.5 shadow-lg hover:scale-110 transition-transform duration-300 touch-manipulation">
          <AlgorandMark size={18} className="xs:w-5 xs:h-5 md:w-6 md:h-6" color="white" />
        </div>
        <span className="text-white text-sm xs:text-base md:text-xl font-display tracking-wider drop-shadow-lg hidden xs:inline">ALGO Catcher</span>
      </div>

      {/* Centered login card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md bg-white rounded-lg xs:rounded-xl sm:rounded-xl md:rounded-2xl shadow-2xl p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in zoom-in-95 duration-700 delay-150 mx-2 xs:mx-3">

          {/* Icon at top */}
          <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
            <div className="bg-black rounded-md xs:rounded-lg sm:rounded-xl p-1.5 xs:p-2 sm:p-3 shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer touch-manipulation">
              <Gamepad2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1 xs:space-y-1.5 sm:space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-display text-gray-900 tracking-wide">
              Sign in with email
            </h1>
            <p className="text-gray-600 text-[11px] xs:text-xs sm:text-sm leading-relaxed px-1 xs:px-1 sm:px-2 md:px-0">
              Catch falling ALGO coins and climb the leaderboard. Play for free and compete with players worldwide.
            </p>
          </div>

          {loginState === "success" && wallet ? (
            <div className="text-center space-y-4 xs:space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle2 className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 text-green-600 mx-auto animate-in zoom-in duration-300" />
                  <div className="absolute inset-0 bg-green-600/20 rounded-full animate-ping" />
                </div>
              </div>
              <div className="space-y-1.5 xs:space-y-2">
                <p className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900">
                  Welcome! 🎮
                </p>
                <p className="text-gray-600 text-[11px] xs:text-xs md:text-sm">
                  Your wallet is ready to play
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg xs:rounded-xl p-3 xs:p-4 md:p-5 space-y-1.5 xs:space-y-2">
                <p className="text-[10px] xs:text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Your Algorand Wallet:
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 xs:gap-2 bg-white rounded-md xs:rounded-lg p-2 xs:p-3 border border-gray-200">
                  <p className="font-mono text-[10px] xs:text-xs break-all text-gray-900 flex-1 text-left sm:text-center">
                    {wallet}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-6 xs:h-7 px-2 xs:px-3 text-[10px] xs:text-xs hover:bg-gray-100 transition-colors touch-manipulation"
                    onClick={() => {
                      navigator.clipboard.writeText(wallet);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 pt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to game…</span>
              </div>
            </div>
          ) : (
            <>

              {/* Email Input */}
              <div className="space-y-2.5 xs:space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                <div className="relative group">
                  <Mail className="absolute left-2.5 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 md:w-5 md:h-5 text-gray-400 pointer-events-none group-focus-within:text-gray-600 transition-colors" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loginState === "loading"}
                    className="pl-9 xs:pl-10 sm:pl-11 md:pl-12 h-9 xs:h-10 sm:h-11 md:h-12 rounded-md xs:rounded-lg sm:rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all text-xs xs:text-sm sm:text-sm md:text-base touch-manipulation"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md xs:rounded-lg p-2 xs:p-2.5 sm:p-3 animate-in slide-in-from-top-1 duration-300 shake">
                    <p className="text-xs xs:text-xs md:text-sm text-red-700 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={loginState === "loading" || !email.trim()}
                  className="w-full rounded-md xs:rounded-lg sm:rounded-xl bg-gray-900 text-white h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-xs sm:text-sm md:text-base font-semibold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]"
                >
                  {loginState === "loading" ? (
                    <>
                      <Loader2 className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin mr-1 xs:mr-1.5 sm:mr-2" />
                      <span className="text-xs xs:text-xs sm:text-xs md:text-base">Sending…</span>
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 animate-in fade-in duration-700 delay-900">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-500">Or sign in with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loginState === "loading"}
                variant="outline"
                className="w-full rounded-md xs:rounded-lg sm:rounded-xl h-9 xs:h-10 sm:h-11 md:h-12 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs xs:text-xs sm:text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000 touch-manipulation min-h-[44px]"
              >
                <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 xs:mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}