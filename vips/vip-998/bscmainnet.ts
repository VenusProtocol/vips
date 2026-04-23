import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import opbnbData from "../../simulations/vip-998/utils/marketData_opbnbmainnet.json";
import opmainnetData from "../../simulations/vip-998/utils/marketData_opmainnet.json";
import unichainData from "../../simulations/vip-998/utils/marketData_unichainmainnet.json";

// ──────────────────────────────────────────────────────────────────────
// Per-market snapshot shape, produced by simulations/vip-998/utils/fetchMarketData.ts.
// `generatePoolCommands` uses the booleans/numeric fields to skip no-op commands
// (market already paused, cap already 0, CF already 0) so the cross-chain
// payload only contains work that actually changes state.
// `liquidationThreshold` is carried through to the `setCollateralFactor` call
// unchanged — CF is set to 0 but LT must be preserved so liquidations of
// unhealthy positions remain possible during the exit window.
// ──────────────────────────────────────────────────────────────────────
interface Market {
  name: string;
  address: string;
  isMintActionPaused: boolean;
  isBorrowActionPaused: boolean;
  isEnterMarketActionPaused: boolean;
  supplyCap: string;
  borrowCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
}

interface Pool {
  name: string;
  comptroller: string;
  markets: Market[];
}

interface NetworkData {
  pools: Pool[];
  totals?: {
    totalMintPaused: number;
    totalBorrowPaused: number;
    totalEnterMarketPaused: number;
    totalSupplyCap: number;
    totalBorrowCap: number;
    totalCollateralFactor: number;
  };
}

export const ADDRESS_DATA = {
  opbnbmainnet: opbnbData as NetworkData,
  unichainmainnet: unichainData as NetworkData,
  opmainnet: opmainnetData as NetworkData,
};

export const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

// Emits the per-pool command set for Phase 1 Step 1 (block new activity).
// Each sub-block filters the market list by its current on-chain state so
// that already-applied settings don't generate redundant calls. This keeps
// the LayerZero payload small and idempotent across re-runs.
const generatePoolCommands = (pool: Pool, dstChainId: LzChainId) => {
  const commands = [];
  const { comptroller, markets } = pool;

  // Pause MINT: block new supply. Existing suppliers can still redeem.
  const marketsNeedingMintPause = markets.filter(m => !m.isMintActionPaused);
  if (marketsNeedingMintPause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [marketsNeedingMintPause.map(m => m.address), [Actions.MINT], true],
      dstChainId,
    });
  }

  // Pause BORROW: block new borrows. Existing borrowers can still repay.
  const marketsNeedingBorrowPause = markets.filter(m => !m.isBorrowActionPaused);
  if (marketsNeedingBorrowPause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [marketsNeedingBorrowPause.map(m => m.address), [Actions.BORROW], true],
      dstChainId,
    });
  }

  // Pause ENTER_MARKET: stop new users from using these vTokens as collateral.
  // `exitMarket` remains open so existing users can unwind.
  const marketsNeedingEnterMarketPause = markets.filter(m => !m.isEnterMarketActionPaused);
  if (marketsNeedingEnterMarketPause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [marketsNeedingEnterMarketPause.map(m => m.address), [Actions.ENTER_MARKET], true],
      dstChainId,
    });
  }

  // Zero supply caps: belt-and-suspenders with the MINT pause. Guards against
  // any alternative supply path re-introducing deposits.
  const marketsNeedingSupplyCapZero = markets.filter(m => m.supplyCap !== "0");
  if (marketsNeedingSupplyCapZero.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [marketsNeedingSupplyCapZero.map(m => m.address), marketsNeedingSupplyCapZero.map(() => 0)],
      dstChainId,
    });
  }

  // Zero borrow caps: belt-and-suspenders with the BORROW pause.
  const marketsNeedingBorrowCapZero = markets.filter(m => m.borrowCap !== "0");
  if (marketsNeedingBorrowCapZero.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [marketsNeedingBorrowCapZero.map(m => m.address), marketsNeedingBorrowCapZero.map(() => 0)],
      dstChainId,
    });
  }

  // CF = 0, LT preserved. Drops borrowing power of existing collateral to 0
  // (healthy users are pushed to exit) while keeping the liquidation threshold
  // intact so unhealthy positions can still be liquidated. 
  for (const market of markets.filter(m => m.collateralFactor !== "0")) {
    commands.push({
      target: comptroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [market.address, 0, market.liquidationThreshold],
      dstChainId,
    });
  }

  return commands;
};

export const vip998 = () => {
  const meta = {
    version: "v2",
    title: "VIP-998 Core Pool Sunset Phase 1 Step 1 — Block New Activity on opBNB, Unichain, Optimism",
    description: `#### Summary

VIP of the Venus Core Pool sunset on **opBNB**, **Unichain**, and **Optimism**. This proposal blocks **new** supply, borrow, and enter-as-collateral activity on every Core Pool market across the three chains. Redeem, repay, liquidate, exit-market, and transfer remain fully open so existing positions can unwind safely during the exit window.

Sunset plan reference: a two-step market sunset is mandatory. Step 1 (this VIP) blocks new activity only. Step 2 (Phase 2, future VIP) pauses the remaining user actions, drops \`liquidationThreshold\` to 0, and calls \`unlistMarket\`.

#### Actions (applied per Core Pool market on each chain)

1. **Pause MINT** via \`Comptroller.setActionsPaused\` — blocks new supply. Redeem stays open.
2. **Pause BORROW** via \`Comptroller.setActionsPaused\` — blocks new borrows. Repay stays open.
3. **Pause ENTER_MARKET** via \`Comptroller.setActionsPaused\` — stops new users from using these vTokens as collateral. \`exitMarket\` remains open.
4. **\`supplyCap = 0\`** via \`Comptroller.setMarketSupplyCaps\` — belt-and-suspenders with the MINT pause.
5. **\`borrowCap = 0\`** via \`Comptroller.setMarketBorrowCaps\` — belt-and-suspenders with the BORROW pause.
6. **\`collateralFactor = 0\`, \`liquidationThreshold\` unchanged** via \`Comptroller.setCollateralFactor\` — drops new-loan collateral power to zero while preserving the ability to liquidate unhealthy positions.

Each sub-call is data-driven against a pre-run snapshot (\`marketData_<chain>.json\`) and is omitted when the market is already in the target state, so the LayerZero payload contains only the deltas.

#### Markets affected

- **opBNB** Comptroller_Core (\`0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd\`): vWBNB, vBTCB, vETH, vUSDT, vFDUSD — 5 markets.
- **Unichain** Comptroller_Core (\`0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe\`): vWETH, vWBTC, vUSDC, vUSD₮0, vUNI, vweETH, vwstETH — 7 markets.
- **Optimism** Comptroller_Core (\`0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC\`): vWETH, vWBTC, vUSDC, vUSDT, vOP — 5 markets.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...ADDRESS_DATA.opbnbmainnet.pools.flatMap(p => generatePoolCommands(p, LzChainId.opbnbmainnet)),
      ...ADDRESS_DATA.unichainmainnet.pools.flatMap(p => generatePoolCommands(p, LzChainId.unichainmainnet)),
      ...ADDRESS_DATA.opmainnet.pools.flatMap(p => generatePoolCommands(p, LzChainId.opmainnet)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip998;
