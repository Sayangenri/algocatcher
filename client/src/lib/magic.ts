import { Magic } from "magic-sdk";
import { AlgorandExtension } from "@magic-ext/algorand";
import { OAuthExtension } from "@magic-ext/oauth2";

const algorand = new AlgorandExtension({ rpcUrl: "" });
const oauth = new OAuthExtension();

const baseMagic = new Magic(
  import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY!,
  {
    extensions: [algorand, oauth],
  }
);

// 🔥 Create a properly typed wrapper
export const magic = {
  ...baseMagic,
  algorand,
  oauth2: oauth,
};