import { BigNumberish } from "ethers";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as arb from "./data/arbitrumone";
import * as base from "./data/basemainnet";
import * as bsc from "./data/bscmainnet";
import * as eth from "./data/ethereum";
import * as zk from "./data/zksyncmainnet";

export interface CFEntry {
  symbol: string;
  vToken: string;
  old: BigNumberish;
  new: BigNumberish;
  liquidationThreshold: BigNumberish;
}

export interface CapEntry {
  symbol: string;
  vToken: string;
  supplyCap?: { old: BigNumberish; new: BigNumberish };
  borrowCap?: { old: BigNumberish; new: BigNumberish };
}

export interface PauseEntry {
  symbol: string;
  vToken: string;
  old: boolean;
  new: boolean;
}

const BORROW = 2;

const meta = {
  version: "v2",
  title: "VIP-999 Multi-Chain Core Pool Risk Parameter Cleanup",
  description: `#### Summary

Cleanup pass across the five Venus Core deployments (BNB Chain, Ethereum, Arbitrum, Base, zkSync Era). Following the 2026-03-15 THE market exploit, the four non-BNB Core deployments have been in emergency-pause since 2026-03-20. This proposal formalises off-boarding of impaired / deprecated assets, right-sizes caps with the standard ~2x 3-month max-observed rule (subject to a $5M stables / 2,100 WETH / 65 WBTC notional ceiling on non-BNB chains), and re-enables borrowing on the chosen subset of healthy markets on the four paused chains.

Liquidation thresholds are not touched. CF -> 0 removes new-borrow power only; existing positions are unaffected.

#### Actions per chain

- **BNB Chain Core** (Unitroller \`0xfD36E2c2a6789Db23113685031d7F16329158384\`): CF -> 0 on DAI; full wind-down (caps -> 0 + pause borrow) on THE/TUSD/FIL/MATIC; cap right-sizing on the rest.
- **Ethereum Core** (\`0x687a01ecF6d3907658f7A7c714749fAC32336D1B\`): full delist of TUSD/EIGEN/BAL/yvUSDS-1/yvUSDC-1/yvUSDT-1/yvWETH-1; CF -> 0 on DAI/crvUSD/USDe; cap right-sizing; re-enable borrow on USDT/WETH/WBTC/USDC/DAI/crvUSD/USDe/tBTC/USDS.
- **Arbitrum Core** (\`0x317c1A5739F39046E20b08ac9BeEa3f10fD43326\`): CF 55% -> 25% on ARB (borrow stays paused); cap right-sizing; re-enable borrow on USD₮0/WBTC/WETH/USDC.
- **Base Core** (\`0x0C7973F9598AA62f9e03B94E92C967fD5437426C\`): full delist of wsuperOETHb; cap right-sizing (wstETH borrow stays paused); re-enable borrow on cbBTC/USDC/WETH.
- **zkSync Era Core** (\`0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1\`): full delist of ZK/wUSDM/zkETH/wstETH; WBTC cap reduction (borrow stays paused); re-enable borrow on WETH/USDT/USDC.e/USDC.
`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip999 = () =>
  makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────────
      // BNB Chain Core
      // ──────────────────────────────────────────────────────────────────────────

      // Step 1: set collateral factors.
      ...bsc.cfChanges.map(c => ({
        target: bsc.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
      })),

      // Step 2: set supply caps.
      {
        target: bsc.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          bsc.capChanges.filter(c => c.supplyCap).map(c => c.vToken),
          bsc.capChanges.filter(c => c.supplyCap).map(c => c.supplyCap!.new),
        ],
      },

      // Step 3: set borrow caps.
      {
        target: bsc.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          bsc.capChanges.filter(c => c.borrowCap).map(c => c.vToken),
          bsc.capChanges.filter(c => c.borrowCap).map(c => c.borrowCap!.new),
        ],
      },

      // Step 4: pause borrow on TUSD / FIL.
      {
        target: bsc.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [bsc.borrowPauseChanges.filter(c => c.new).map(c => c.vToken), [BORROW], true],
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Ethereum Core
      // ──────────────────────────────────────────────────────────────────────────

      // Step 1: set collateral factors.
      ...eth.cfChanges.map(c => ({
        target: eth.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.ethereum,
      })),

      // Step 2: set supply caps.
      {
        target: eth.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          eth.capChanges.filter(c => c.supplyCap).map(c => c.vToken),
          eth.capChanges.filter(c => c.supplyCap).map(c => c.supplyCap!.new),
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Step 3: set borrow caps.
      {
        target: eth.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          eth.capChanges.filter(c => c.borrowCap).map(c => c.vToken),
          eth.capChanges.filter(c => c.borrowCap).map(c => c.borrowCap!.new),
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Step 4: re-enable borrow on healthy markets.
      {
        target: eth.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [eth.borrowPauseChanges.filter(c => !c.new).map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.ethereum,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Arbitrum Core
      // ──────────────────────────────────────────────────────────────────────────

      // Step 1: set collateral factors.
      ...arb.cfChanges.map(c => ({
        target: arb.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.arbitrumone,
      })),

      // Step 2: set supply caps.
      {
        target: arb.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          arb.capChanges.filter(c => c.supplyCap).map(c => c.vToken),
          arb.capChanges.filter(c => c.supplyCap).map(c => c.supplyCap!.new),
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      // Step 3: set borrow caps.
      {
        target: arb.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          arb.capChanges.filter(c => c.borrowCap).map(c => c.vToken),
          arb.capChanges.filter(c => c.borrowCap).map(c => c.borrowCap!.new),
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      // Step 4: re-enable borrow on USD₮0 / WBTC / WETH / USDC.
      {
        target: arb.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [arb.borrowPauseChanges.filter(c => !c.new).map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.arbitrumone,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Base Core
      // ──────────────────────────────────────────────────────────────────────────

      // Step 1: set collateral factors.
      ...base.cfChanges.map(c => ({
        target: base.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.basemainnet,
      })),

      // Step 2: set supply caps.
      {
        target: base.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          base.capChanges.filter(c => c.supplyCap).map(c => c.vToken),
          base.capChanges.filter(c => c.supplyCap).map(c => c.supplyCap!.new),
        ],
        dstChainId: LzChainId.basemainnet,
      },

      // Step 3: set borrow caps.
      {
        target: base.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          base.capChanges.filter(c => c.borrowCap).map(c => c.vToken),
          base.capChanges.filter(c => c.borrowCap).map(c => c.borrowCap!.new),
        ],
        dstChainId: LzChainId.basemainnet,
      },

      // Step 4: re-enable borrow on cbBTC / USDC / WETH.
      {
        target: base.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [base.borrowPauseChanges.filter(c => !c.new).map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.basemainnet,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // zkSync Era Core
      // ──────────────────────────────────────────────────────────────────────────

      // Step 1: set collateral factors.
      ...zk.cfChanges.map(c => ({
        target: zk.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.zksyncmainnet,
      })),

      // Step 2: set supply caps.
      {
        target: zk.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          zk.capChanges.filter(c => c.supplyCap).map(c => c.vToken),
          zk.capChanges.filter(c => c.supplyCap).map(c => c.supplyCap!.new),
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Step 3: set borrow caps.
      {
        target: zk.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          zk.capChanges.filter(c => c.borrowCap).map(c => c.vToken),
          zk.capChanges.filter(c => c.borrowCap).map(c => c.borrowCap!.new),
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Step 4: re-enable borrow
      {
        target: zk.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [zk.borrowPauseChanges.filter(c => !c.new).map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip999;
