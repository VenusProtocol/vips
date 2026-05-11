import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as arb from "./data/arbitrumone";
import * as base from "./data/basemainnet";
import * as bsc from "./data/bscmainnet";
import * as eth from "./data/ethereum";
import * as zk from "./data/zksyncmainnet";

export interface CFEntry {
  symbol: string;
  vToken: string;
  before: string;
  after: string;
  liquidationThreshold: string;
}

export interface CapEntry {
  symbol: string;
  vToken: string;
  before: string;
  after: string;
}

export interface PauseEntry {
  symbol: string;
  vToken: string;
  before: boolean;
  after: boolean;
}

const BORROW_ACTION = 2;

// ─── Semantic command builders ──────────────────────────────────────────────

const buildCollateralFactorCommands = (comptroller: string, changes: CFEntry[]): Command[] =>
  changes.map(c => ({
    target: comptroller,
    signature: "setCollateralFactor(address,uint256,uint256)",
    params: [c.vToken, c.after, c.liquidationThreshold],
  }));

const buildSupplyCapCommands = (comptroller: string, changes: CapEntry[]): Command[] => [
  {
    target: comptroller,
    signature: "setMarketSupplyCaps(address[],uint256[])",
    params: [changes.map(c => c.vToken), changes.map(c => c.after)],
  },
];

const buildBorrowCapCommands = (comptroller: string, changes: CapEntry[]): Command[] => [
  {
    target: comptroller,
    signature: "setMarketBorrowCaps(address[],uint256[])",
    params: [changes.map(c => c.vToken), changes.map(c => c.after)],
  },
];

// Pause changes are batched per target state
const buildBorrowPauseCommands = (comptroller: string, changes: PauseEntry[]): Command[] =>
  [true, false].flatMap(targetState => {
    const vTokens = changes.filter(c => c.after === targetState).map(c => c.vToken);
    if (vTokens.length === 0) return [];
    return [
      {
        target: comptroller,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [vTokens, [BORROW_ACTION], targetState],
      },
    ];
  });

// Tag every command with dstChainId so the OmnichainProposalSender routes
// the batch to the target chain via LayerZero.
const withDstChain = (commands: Command[], dstChainId: LzChainId): Command[] =>
  commands.map(c => ({ ...c, dstChainId }));

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
      //
      // BNB Chain (Diamond Comptroller, governance hub — no dstChainId)
      //
      ...buildCollateralFactorCommands(bsc.COMPTROLLER, bsc.cfChanges),

      ...buildSupplyCapCommands(bsc.COMPTROLLER, bsc.supplyCapChanges),

      ...buildBorrowCapCommands(bsc.COMPTROLLER, bsc.borrowCapChanges),

      ...buildBorrowPauseCommands(bsc.COMPTROLLER, bsc.borrowPauseChanges),

      //
      // Ethereum
      //
      ...withDstChain(
        [
          ...buildCollateralFactorCommands(eth.COMPTROLLER, eth.cfChanges),

          ...buildSupplyCapCommands(eth.COMPTROLLER, eth.supplyCapChanges),

          ...buildBorrowCapCommands(eth.COMPTROLLER, eth.borrowCapChanges),

          ...buildBorrowPauseCommands(eth.COMPTROLLER, eth.borrowPauseChanges),
        ],
        LzChainId.ethereum,
      ),

      //
      // Arbitrum
      //
      ...withDstChain(
        [
          ...buildCollateralFactorCommands(arb.COMPTROLLER, arb.cfChanges),

          ...buildSupplyCapCommands(arb.COMPTROLLER, arb.supplyCapChanges),

          ...buildBorrowCapCommands(arb.COMPTROLLER, arb.borrowCapChanges),

          ...buildBorrowPauseCommands(arb.COMPTROLLER, arb.borrowPauseChanges),
        ],
        LzChainId.arbitrumone,
      ),

      //
      // Base
      //
      ...withDstChain(
        [
          ...buildCollateralFactorCommands(base.COMPTROLLER, base.cfChanges),

          ...buildSupplyCapCommands(base.COMPTROLLER, base.supplyCapChanges),

          ...buildBorrowCapCommands(base.COMPTROLLER, base.borrowCapChanges),

          ...buildBorrowPauseCommands(base.COMPTROLLER, base.borrowPauseChanges),
        ],
        LzChainId.basemainnet,
      ),

      //
      // zkSync Era
      //
      ...withDstChain(
        [
          ...buildCollateralFactorCommands(zk.COMPTROLLER, zk.cfChanges),

          ...buildSupplyCapCommands(zk.COMPTROLLER, zk.supplyCapChanges),

          ...buildBorrowCapCommands(zk.COMPTROLLER, zk.borrowCapChanges),

          ...buildBorrowPauseCommands(zk.COMPTROLLER, zk.borrowPauseChanges),
        ],
        LzChainId.zksyncmainnet,
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip999;
