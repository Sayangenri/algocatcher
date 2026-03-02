import { useEffect } from "react";
import { useLocation } from "wouter";
import { magic } from "../lib/magic";

export default function Callback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // Complete OAuth
        await magic.oauth2.getRedirectResult();

        // Get wallet
        const wallet = await magic.algorand.getWallet();

        // Redirect using wouter
        setLocation(`/?wallet=${wallet}`);
      } catch (err) {
        console.error("OAuth callback error:", err);
      }
    };

    finishLogin();
  }, [setLocation]);

  return <p>Logging you in...</p>;
}