import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbartio } = NETWORK_ADDRESSES;

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1ba10ca9a744131aD8428D719767816A693c3b71";
export const ACM = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const PSR = "0xE4dD1B52c3D9d93d42B44cB77D769A9F73225012";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x9aEDab5FFD5CfeA4aF0bcFBC618cB48a53936034";
export const COMPTROLLER_CORE = "0x854Ba54c41bE5e54408EDF432e28A195Bcd3E88d";

export const MOCK_USDCe = "0x0A912ebEc8D4a35568C1BFE368AD68A548597906";
export const VUSDCe = "0x758bCc00C4436d23de0290EFdE106793Af9f3a6B";
export const WETH = "0x5A4bcFa0cf7f029bb5A62Cd52a24F7B2d0C18d2A";
export const VWETH = "0x5479B79B9719C558Ed69234E4fE77ce2167cA291";
export const WBERA = "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8";
export const VWBERA = "0x860B3A4B7B6BaA714BB72AD67092E3e858fDb621";

const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-4539",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [7],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 10000, berachainbartio.VTREASURY],
            [1, 10000, berachainbartio.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PSR,
        signature: "setPoolRegistry(address)",
        params: [berachainbartio.POOL_REGISTRY],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },

      {
        target: berachainbartio.POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [], dstChainId: LzChainId.berachainbartio },
      {
        target: COMPTROLLER_CORE,
        signature: "setPriceOracle(address)",
        params: [berachainbartio.RESILIENT_ORACLE],
        dstChainId: LzChainId.berachainbartio,
      },

      // Add pool
      {
        target: berachainbartio.POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.berachainbartio,
      },

      // Add USDC.e market
      {
        target: MOCK_USDCe,
        signature: "faucet(uint256)",
        params: [parseUnits("5000", 6)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: MOCK_USDCe,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: MOCK_USDCe,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, parseUnits("5000", 6)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: VUSDCe,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDCe,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("5000", 6), // INITIAL_SUPPLY
            berachainbartio.VTREASURY,
            parseUnits("20000000", 6), // SUPPLY_CAP
            parseUnits("18000000", 6), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbartio,
      },

      // Add WETH market
      {
        target: WETH,
        signature: "faucet(uint256)",
        params: [parseUnits("2", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: WETH,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: WETH,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, parseUnits("2", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: VWETH,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VWETH,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("2", 18), // INITIAL_SUPPLY
            berachainbartio.VTREASURY,
            parseUnits("700", 18), // SUPPLY_CAP
            parseUnits("350", 18), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbartio,
      },

      // Add WBERA market
      {
        target: WBERA,
        signature: "deposit()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
        value: parseUnits("0.05", 18).toString(),
      },
      {
        target: WBERA,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: WBERA,
        signature: "approve(address,uint256)",
        params: [berachainbartio.POOL_REGISTRY, parseUnits("0.05", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: VWBERA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VWBERA,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("0.05", 18), // INITIAL_SUPPLY
            berachainbartio.VTREASURY,
            parseUnits("4000000", 18), // SUPPLY_CAP
            parseUnits("3500000", 18), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbartio,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
