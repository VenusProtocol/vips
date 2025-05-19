import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_ARBITRUM_SEPOLIA = "0x6708bAd042916B47311c8078b29d7f432342102F";
export const CHAINLINK_ORACLE_ORACLE_ARBITRUM_SEPOLIA = "0xeDd02c7FfA31490b4107e8f2c25e9198a04F9E45";
export const REDSTONE_ORACLE_ORACLE_ARBITRUM_SEPOLIA = "0x15058891ca0c71Bd724b873c41596A682420613C";
export const BOUND_VALIDATOR_ARBITRUM_SEPOLIA = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA = "0xA78A1Df376c3CEeBC5Fab574fe6EdDbbF76fd03e";
export const RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA = "0x992127c0cd1af5c0Ae40995193ac1adA752C12a8";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA = "0xc8614663Cc4ee868EF5267891E177586d7105D7F";
export const REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM_SEPOLIA = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
export const weETH_ORACLE_ARBITRUM_SEPOLIA = "0x0E2a7C58e06d4924EF74fb14222aa087ECfc14D5";
export const weETH_ARBITRUM_SEPOLIA = "0x243141DBff86BbB0a082d790fdC21A6ff615Fa34";
export const wstETHOracle_ARBITRUM_SEPOLIA = "0xFfc4869368a3954A1b933AC94471f12B7e83C24a";
export const wstETH_ARBITRUM_SEPOLIA = "0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE";

export const RESILIENT_ORACLE_ZKSYNC_SEPOLIA = "0x748853B3bE26c46b4562Fd314dfb82708F395bDf";
export const CHAINLINK_ORACLE_ORACLE_ZKSYNC_SEPOLIA = "0x0DFf10dCdb3526010Df01ECc42076C25C27F8323";
export const REDSTONE_ORACLE_ORACLE_ZKSYNC_SEPOLIA = "0x3af097f1Dcec172D5ECdD0D1eFA6B118FF15f152";
export const BOUND_VALIDATOR_ZKSYNC_SEPOLIA = "0x0A4daBeF41C83Af7e30FfC33feC56ba769f3D24b";
export const DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA = "0x18E44f588a4DcF2F7145d35A5C226e129040b6D3";
export const RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA = "0x4eE2399B57796A94644E1dFb5e4751FaCbE05c2E";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA = "0x58d8a589c111161dBb22742BF00671BEa1e32994";
export const REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA = "0x04D8444A4aDbE4697B2Ba6Dd7Cd174bf5a37098c";
export const BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC_SEPOLIA = "0x66e6744104fAa55C14A6CD356eF1016E50B907df";
export const wUSDM_ORACLE_ZKSYNC_SEPOLIA = "0xBd09B8f1cD699F97d2c4387Fb6eA87853cF2A144";
export const wUSDM_ZKSYNC_SEPOLIA = "0x0b3C8fB109f144f6296bF4Ac52F191181bEa003a";
export const wstETHOracle_ZKSYNC_SEPOLIA = "0xE454a8795b0077C656B4a2B4C0e72C1f3959CfCA";
export const wstETH_ZKSYNC_SEPOLIA = "0x8507bb4F4f0915D05432011E384850B65a7FCcD1";
export const zkETHOracle_ZKSYNC_SEPOLIA = "0x4C7cA0B8A23d6ff73D7dd1f74096D25628f90348";
export const zkETH_ZKSYNC_SEPOLIA = "0x13231E8B60BE0900fB3a3E9dc52C2b39FA4794df";

export const vip499 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ARBITRUM_SEPOLIA, RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ORACLE_ARBITRUM_SEPOLIA, CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ORACLE_ARBITRUM_SEPOLIA, REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ARBITRUM_SEPOLIA, BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM_SEPOLIA],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH_ARBITRUM_SEPOLIA,
            [weETH_ORACLE_ARBITRUM_SEPOLIA, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ARBITRUM_SEPOLIA,
            [wstETHOracle_ARBITRUM_SEPOLIA, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ZKSYNC_SEPOLIA, RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ORACLE_ZKSYNC_SEPOLIA, CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ORACLE_ZKSYNC_SEPOLIA, REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ZKSYNC_SEPOLIA, BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC_SEPOLIA],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wUSDM_ZKSYNC_SEPOLIA,
            [wUSDM_ORACLE_ZKSYNC_SEPOLIA, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ZKSYNC_SEPOLIA,
            [wstETHOracle_ZKSYNC_SEPOLIA, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            zkETH_ZKSYNC_SEPOLIA,
            [zkETHOracle_ZKSYNC_SEPOLIA, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip499;
