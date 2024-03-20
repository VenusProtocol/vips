/* eslint-disable @typescript-eslint/no-explicit-any */
import 'hardhat/types/runtime';

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    forkedNetwork: "bsctestnet" | "bscmainnet" | "sepolia" | "ethereum" | "opbnbtestnet" | "opbnbmainnet";
  }
}