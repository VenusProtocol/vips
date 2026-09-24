import { BigNumber, BigNumberish } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as bsc from "./data/bscmainnet";
import * as zk from "./data/zksyncmainnet";

export const AUXILIARY_AGGREGATOR = {
  ethereum: "0x884E46c8639c8CaFcf249e34c22575f4dD09E87D",
  arbitrumone: "0xFAC9571b6406aD7c135a34859A121739FFf3C47a",
  basemainnet: "0x26FA3316c344B5d3261c44e67c6a72C926EEB89c",
};

// Remote-chain commands are pre-seeded in AuxiliaryCommandsAggregator instances deployed on
// each destination chain. The batch stored in the aggregator already contains the per-function
// ACM grant/revoke commands wrapping the actual risk-param calls. The VIP simply grants the
// aggregator the DEFAULT_ADMIN_ROLE (so it can call giveCallPermission / revokeCallPermission),
// fires executeBatch(1), then revokes admin.

// ACM permission lookup uses uint256[] in the signature string; the actual call encoding
// accepts uint8[] or uint256[] interchangeably because the parameter is an enum.
export const COMPTROLLER_SIGS = [
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketSupplyCaps(address[],uint256[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setActionsPaused(address[],uint256[],bool)",
];

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

function remoteChainCommands(acm: string, aggregator: string, chainId: LzChainId) {
  const chain = { dstChainId: chainId };
  return [
    { target: acm, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, aggregator], ...chain },
    { target: aggregator, signature: "executeBatch(uint256)", params: [1], ...chain },
    { target: acm, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, aggregator], ...chain },
  ];
}

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
  supplyAlreadyPaused: boolean;
}

// eMode pool CF change on the BSC diamond..
export interface EmodeCFEntry {
  symbol: string;
  poolId: number;
  vToken: string;
  old: BigNumberish;
  new: BigNumberish;
  liquidationThreshold: BigNumberish;
}

export interface EmodeBorrowAllowedEntry {
  symbol: string;
  poolId: number;
  poolLabel: string;
  vToken: string;
  old: boolean;
  new: boolean;
}

const BORROW = 2;
const MINT = 0;

// Generates the four canonical delist actions: CF → 0 (if needed), supply cap → 0,
// borrow cap → 0, pause borrow (if needed). Each action is skipped when already a no-op.
export function delistCommands(comptroller: string, assets: DelistEntry[], dstChainId?: LzChainId) {
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

  const borrowPauseAssets = assets.filter(a => !a.borrowAlreadyPaused);
  if (borrowPauseAssets.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [borrowPauseAssets.map(a => a.vToken), [BORROW], true],
      ...chain,
    });
  }

  const supplyPauseAssets = assets.filter(a => !a.supplyAlreadyPaused);
  if (supplyPauseAssets.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [supplyPauseAssets.map(a => a.vToken), [MINT], true],
      ...chain,
    });
  }

  return commands;
}

const meta = {
  version: "v2",
  title: "VIP-622 [BNB Chain] May 2026 Risk Parameter Update & Asset Off-boarding",
  description: `#### Background

The four active non-BNB Chain Venus deployments (Ethereum, Arbitrum, Base, zkSync) have been in an emergency-paused state since 2026-03-20, following the THE market exploit on 2026-03-15. BNB Core remained operational with parameter-level mitigations across several markets. This proposal specifies the formal off-boarding, parameter restoration, and cap right-sizing across all five Core deployments, and is a prerequisite cleanup pass ahead of unpausing the four chains.

Full rationale and cap-by-cap detail: [Venus Community Forum](https://community.venus.io/t/may-2026-risk-parameter-update-asset-off-boarding/5785). Liquidation thresholds are unchanged; CF → 0 actions affect new borrow power only and do not trigger liquidations on existing positions.

#### BNB Chain Core Pool

- **Off-board as collateral** (CF → 0%): DAI (Sky DAI → USDS deprecation).
- **Already-deprecated assets** (caps → 0, borrows disabled): THE, TUSD, FIL, MATIC (MATIC → POL rebrand).
- **Core cap right-sizing**: BTCB, BNB, WBNB, ETH, USDC, asBNB, xSolvBTC, wBETH, Cake, FDUSD, XRP, USD1, lisUSD, DOGE, ADA, LTC, LINK.

#### Ethereum Core Pool

- **Full delist** (CF → 0%, caps → 0, borrow disabled): TUSD (impaired issuer), EIGEN (dust usage), BAL (project leadership shutdown), yvUSDS-1, yvUSDC-1, yvUSDT-1, yvWETH-1 (empty markets).
- **Remove as collateral, keep as borrow asset**: DAI (Sky deprecation), crvUSD, USDe (less-robust non-yield stables).
- **Cap right-sizing** on USDT, WETH, sUSDS, WBTC, USDC, weETHs, LBTC, DAI, crvUSD, USDe, sUSDe, tBTC, USDS, sFRAX.
- **Re-enable borrowing** for USDT, WETH, WBTC, USDC, DAI, crvUSD, USDe, tBTC, USDS.

#### Arbitrum Core Pool

- **Reduce CF** on ARB 55% → 25% (borrow stays disabled — structurally weak demand).
- **Cap right-sizing** on USD₮0, GM (0x47c0), WBTC, GM (0x70d9), WETH, USDC, ARB.
- **Re-enable borrowing** for USD₮0, WBTC, WETH, USDC.

#### Base Core Pool

- **Full delist**: wsuperOETHb (near-zero demand, stressed on-chain liquidity).
- **Keep borrow disabled (CF retained)**: wstETH (no organic borrow demand).
- **Cap right-sizing** on cbBTC, USDC, WETH, wstETH.
- **Re-enable borrowing** for cbBTC, USDC, WETH.

#### zkSync Era Core Pool

- **Full delist**: ZK (low DEX liquidity), wUSDM (shut-down protocol), zkETH (deprecated), wstETH (chain-wide liquidity insufficient).
- **Keep borrow disabled (CF retained)**: WBTC.
- **Cap right-sizing** on WETH, USDT, USDC.e, WBTC, USDC. zkSync caps sit below the standard non-BNB benchmark, reflecting chain-wide liquidity constraints.
- **Re-enable borrowing** for WETH, USDT, USDC.e, USDC.

#### Methodology

Active caps generally set to ~2× the maximum observed supply / borrow over the past 3 months, tightened where on-chain liquidity, concentration, or liquidator capacity would be stressed. Non-BNB deployments are additionally bounded around ~$5M notional for stables, 2,100 WETH, and 65 WBTC, conditional on liquidity. Full-offboarded assets have caps set to zero.

#### Disclosure

Allez Labs has not been compensated by any third party for publishing this report.
`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip622 = () =>
  makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────────
      // BNB Chain Core
      // ──────────────────────────────────────────────────────────────────────────

      // soft delist of THE / TUSD / FIL (CF already 0; zeros caps, pauses TUSD/FIL).
      ...delistCommands(bsc.COMPTROLLER, bsc.delistAssets),

      // Core-pool CF changes (DAI -> 0, CAKE 55%->50%, XVS 60%->55%, lisUSD 0%->50%).
      ...bsc.cfChanges.map(c => ({
        target: bsc.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
      })),

      // eMode-pool CF changes.
      ...bsc.emodeCfChanges.map(c => ({
        target: bsc.COMPTROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [c.poolId, c.vToken, c.new, c.liquidationThreshold],
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

      // eMode Pool 12 FIL and Pool 15 THE: disable isolated-pool borrow.
      ...bsc.emodeBorrowAllowedChanges.map(e => ({
        target: bsc.COMPTROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [e.poolId, e.vToken, e.new],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // Ethereum Core — via AuxiliaryCommandsAggregator
      // ──────────────────────────────────────────────────────────────────────────
      ...remoteChainCommands(
        NETWORK_ADDRESSES.ethereum.ACCESS_CONTROL_MANAGER,
        AUXILIARY_AGGREGATOR.ethereum,
        LzChainId.ethereum,
      ),

      // ──────────────────────────────────────────────────────────────────────────
      // Arbitrum Core
      // ──────────────────────────────────────────────────────────────────────────

      ...remoteChainCommands(
        NETWORK_ADDRESSES.arbitrumone.ACCESS_CONTROL_MANAGER,
        AUXILIARY_AGGREGATOR.arbitrumone,
        LzChainId.arbitrumone,
      ),

      // ──────────────────────────────────────────────────────────────────────────
      // Base Core
      // ──────────────────────────────────────────────────────────────────────────

      ...remoteChainCommands(
        NETWORK_ADDRESSES.basemainnet.ACCESS_CONTROL_MANAGER,
        AUXILIARY_AGGREGATOR.basemainnet,
        LzChainId.basemainnet,
      ),

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

export default vip622;
