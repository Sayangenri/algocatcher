import { AlgorandExtension } from "@magic-ext/algorand";
import { OAuthExtension } from "@magic-ext/oauth2";

declare module "magic-sdk" {
  interface InstanceWithExtensions<S, E> {
    algorand: AlgorandExtension;
    oauth2: OAuthExtension;
  }
}

export {};