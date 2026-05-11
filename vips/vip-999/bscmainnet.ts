import { BigNumber, BigNumberish } from "ethers";
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
  supplyCap: { old: BigNumberish; new: BigNumberish };
  borrowCap: { old: BigNumberish; new: BigNumberish };
}

export interface PauseEntry {
  symbol: string;
  vToken: string;
  old: boolean;
  new: boolean;
}

// An asset being fully off-boarded: caps → 0, borrow disabled, CF → 0 if not already 0.
export interface DelistEntry {
  symbol: string;
  vToken: string;
  oldCollateralFactor: BigNumberish;
  liquidationThreshold: BigNumberish;
  oldSupplyCap: BigNumberish;
  oldBorrowCap: BigNumberish;
  borrowAlreadyPaused: boolean;
}

const BORROW = 2;

// Generates the four canonical delist actions: CF → 0 (if needed), supply cap → 0,
// borrow cap → 0, pause borrow (if needed). Each action is skipped when already a no-op.
function delistCommands(comptroller: string, assets: DelistEntry[], dstChainId?: LzChainId) {
  const chain = dstChainId !== undefined ? { dstChainId } : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commands: any[] = [];

  for (const a of assets.filter(a => !BigNumber.from(a.oldCollateralFactor).eq(0))) {
    commands.push({
      target: comptroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [a.vToken, "0", a.liquidationThreshold],
      ...chain,
    });
  }

  const supplyCapAssets = assets.filter(a => !BigNumber.from(a.oldSupplyCap).eq(0));
  if (supplyCapAssets.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [supplyCapAssets.map(a => a.vToken), supplyCapAssets.map(() => "0")],
      ...chain,
    });
  }

  const borrowCapAssets = assets.filter(a => !BigNumber.from(a.oldBorrowCap).eq(0));
  if (borrowCapAssets.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [borrowCapAssets.map(a => a.vToken), borrowCapAssets.map(() => "0")],
      ...chain,
    });
  }

  const pauseAssets = assets.filter(a => !a.borrowAlreadyPaused);
  if (pauseAssets.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [pauseAssets.map(a => a.vToken), [BORROW], true],
      ...chain,
    });
  }

  return commands;
}

const meta = {
  version: "v2",
  title: "VIP-999 May 2026 Risk Parameter Update & Asset Off-boarding",
  description: `#### Summary

The four active non-BNB Chain Venus deployments (Ethereum, Arbitrum, Base, zkSync) have been in an emergency-paused state since 2026-03-20, following the THE market exploit on 2026-03-15. BNB Core remained operational with parameter-level mitigations across several markets. This proposal specifies the formal off-boarding, parameter restoration, and cap right-sizing across all five Core deployments, and is a prerequisite cleanup pass ahead of unpausing the four chains.

Liquidation thresholds are not touched. CF -> 0 removes new-borrow power only; existing positions are unaffected.

More information: [Venus Community Forum](https://community.venus.io/t/may-2026-risk-parameter-update-asset-off-boarding/5785)

#### Actions per chain

- **BNB Chain Core** (Unitroller \`0xfD36E2c2a6789Db23113685031d7F16329158384\`): CF -> 0 on DAI; soft delist (caps -> 0 + pause borrow) on THE/TUSD/FIL/MATIC; cap right-sizing on the rest.
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

      // soft delist of THE / TUSD / FIL (CF already 0; zeros caps, pauses TUSD/FIL).
      ...delistCommands(bsc.COMPTROLLER, bsc.delistAssets),

      // set collateral factors (DAI: CF -> 0).
      ...bsc.cfChanges.map(c => ({
        target: bsc.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
      })),

      // set supply caps (skip no-op entries where old === new).
      {
        target: bsc.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          bsc.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).map(c => c.vToken),
          bsc.marketCapChanges
            .filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new))
            .map(c => c.supplyCap.new),
        ],
      },

      // set borrow caps (skip no-op entries where old === new).
      {
        target: bsc.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          bsc.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).map(c => c.vToken),
          bsc.marketCapChanges
            .filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new))
            .map(c => c.borrowCap.new),
        ],
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Ethereum Core
      // ──────────────────────────────────────────────────────────────────────────

      // soft delist of TUSD / EIGEN / BAL / yvUSDS-1 / yvUSDC-1 / yvUSDT-1 / yvWETH-1.
      ...delistCommands(eth.COMPTROLLER, eth.delistAssets, LzChainId.ethereum),

      // set collateral factors (DAI / crvUSD / USDe: CF -> 0, kept as borrow assets).
      ...eth.cfChanges.map(c => ({
        target: eth.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.ethereum,
      })),

      // set supply caps (skip no-op entries where old === new).
      {
        target: eth.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          eth.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).map(c => c.vToken),
          eth.marketCapChanges
            .filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new))
            .map(c => c.supplyCap.new),
        ],
        dstChainId: LzChainId.ethereum,
      },

      // set borrow caps (skip no-op entries where old === new).
      {
        target: eth.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          eth.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).map(c => c.vToken),
          eth.marketCapChanges
            .filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new))
            .map(c => c.borrowCap.new),
        ],
        dstChainId: LzChainId.ethereum,
      },

      // re-enable borrow on healthy markets.
      {
        target: eth.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [eth.borrowPauseChanges.map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.ethereum,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Arbitrum Core
      // ──────────────────────────────────────────────────────────────────────────

      // set collateral factors (ARB: 55% -> 25%, borrow stays paused).
      ...arb.cfChanges.map(c => ({
        target: arb.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
        dstChainId: LzChainId.arbitrumone,
      })),

      // set supply caps (skip no-op entries where old === new).
      {
        target: arb.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          arb.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).map(c => c.vToken),
          arb.marketCapChanges
            .filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new))
            .map(c => c.supplyCap.new),
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      // set borrow caps (skip no-op entries where old === new).
      {
        target: arb.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          arb.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).map(c => c.vToken),
          arb.marketCapChanges
            .filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new))
            .map(c => c.borrowCap.new),
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      // re-enable borrow on USD₮0 / WBTC / WETH / USDC.
      {
        target: arb.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [arb.borrowPauseChanges.map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.arbitrumone,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Base Core
      // ──────────────────────────────────────────────────────────────────────────

      // soft delist of wsuperOETHb.
      ...delistCommands(base.COMPTROLLER, base.delistAssets, LzChainId.basemainnet),

      // set supply caps (skip no-op entries where old === new).
      {
        target: base.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          base.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).map(c => c.vToken),
          base.marketCapChanges
            .filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new))
            .map(c => c.supplyCap.new),
        ],
        dstChainId: LzChainId.basemainnet,
      },

      // set borrow caps (skip no-op entries where old === new).
      {
        target: base.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          base.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).map(c => c.vToken),
          base.marketCapChanges
            .filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new))
            .map(c => c.borrowCap.new),
        ],
        dstChainId: LzChainId.basemainnet,
      },

      // re-enable borrow on cbBTC / USDC / WETH.
      {
        target: base.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [base.borrowPauseChanges.map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.basemainnet,
      },

      // ──────────────────────────────────────────────────────────────────────────
      // zkSync
      // ──────────────────────────────────────────────────────────────────────────

      // soft delist of ZK / wstETH / wUSDM / zkETH.
      ...delistCommands(zk.COMPTROLLER, zk.delistAssets, LzChainId.zksyncmainnet),

      // set supply caps (skip no-op entries where old === new).
      {
        target: zk.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          zk.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).map(c => c.vToken),
          zk.marketCapChanges
            .filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new))
            .map(c => c.supplyCap.new),
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // set borrow caps (skip no-op entries where old === new).
      {
        target: zk.COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          zk.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).map(c => c.vToken),
          zk.marketCapChanges
            .filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new))
            .map(c => c.borrowCap.new),
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // re-enable borrow on WETH / USDT / USDC.e / USDC.
      {
        target: zk.COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [zk.borrowPauseChanges.map(c => c.vToken), [BORROW], false],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip999;
