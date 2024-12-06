/* eslint-disable @typescript-eslint/no-explicit-any */
import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    FORKED_NETWORK?:
      | "bsctestnet"
      | "bscmainnet"
      | "sepolia"
      | "ethereum"
      | "opbnbtestnet"
      | "opbnbmainnet"
      | "arbitrumone"
      | "arbitrumsepolia"
      | "zksyncsepolia"
      | "zksyncmainnet";
  }
}
