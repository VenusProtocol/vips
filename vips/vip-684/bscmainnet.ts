import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { pct, tokens } from "../vip-675/commands";
import { BSTOCK_PAUSE_SENTINEL } from "../vip-680/bscmainnet";
import {
  ADAPTER_FRV,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  NOON_VAULT,
  POSITION_TOKEN_ID,
  SUSN,
  U_FRV_SOURCE,
  riskConfig,
  vaultConfig,
} from "../vip-683/bscmainnet";
import {
  ANTB_MARKET,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  AntbMarket,
  DEVIATION_BOUNDED_ORACLE,
  MAINSTREAM_POOL_NAME,
  NORMAL_TIMELOCK,
  POOL,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  VTREASURY,
} from "./addresses/bscmainnet";

// ===================================================================================================
// VIP-684 [BNB Chain], four independent parts, all from the Normal Timelock:
//  1. Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% margin.
//  2. List ANTB as collateral in the bStock mainstream Spoke pool.
//  3. Remove three matured FRVs from the Liquidity Hub's FRV sources.
//  4. Whitelist a Chainlink OEV searcher for Core Pool flash loans.
// ===================================================================================================

// ===================================================================================================
// Part 1: relist the Noon Capital sUSN vault with a 0.01% margin.
//
// VIP-683 created the Noon vault with a 100% margin: Noon had to deposit all 1,152,073.71 sUSN before the
// vault could open. Noon wants to open it with a small deposit, so this VIP cancels and closes that vault and creates
// a new one on the same terms with a 0.01% margin.
// ===================================================================================================

// The VIP-683 vault. Still in WaitingForMargin, with no collateral and no shares.
export const OLD_NOON_VAULT = NOON_VAULT;

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 1, from the current vaultImplementation.
// Execution precondition: until this VIP executes, no other vault may be created for this operator (createVault is
// also held by the Fast-track Timelock and the Critical Guardian) and vaultImplementation must not change. Either
// moves the vault to another address, and addResource on this empty one reverts the whole proposal.
export const NEW_NOON_VAULT = "0x7967aA085051cFd1412E14a8Be8466bb31ee4d68";

export const MARGIN_RATE = parseUnits("0.0001", 18); // 0.01%
export const MARGIN_AMOUNT = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18)); // 115.207371 sUSN

export const VAULT_NAME = "FRV Noon sUSN 16NOV2026 30";
export const VAULT_SYMBOL = "FRV-nn-16NOV2026-30";

// Loan and risk terms are VIP-683's vaultConfig and riskConfig, unchanged; only the margin rate differs.
export const instConfig = [
  SUSN, // collateralAsset
  IDEAL_COLLATERAL_AMOUNT, // idealCollateralAmount
  MARGIN_RATE, // marginRate
  INSTITUTION_OPERATOR, // institutionOperator
  POSITION_TOKEN_ID, // positionTokenId (overwritten)
];

// ===================================================================================================
// Part 2: list ANTB as collateral in the bStock mainstream Spoke pool.
//
// The same steps as VIP-677 and VIP-678, which added collateral markets to the pool VIP-675 created, for one market:
//  1. Price ANTB: Atlas, the ResilientOracle, then the DBO, whose `setTokenConfigs` reads the live price. Before the
//     listing, because `addMarket` sets a collateral factor above 0, which needs a nonzero price.
//  2. List it: VTreasury withdrawal, approve and `addMarket`, which pulls the seed from the Normal Timelock. Then have
//     the BStockPauseSentinel monitor it, as VIP-680 did for the pool's other bStocks.
//  3. Its reserve delta, its own liquidation incentive, its protocol seize share (after the incentive, which bounds it)
//     and BORROW paused.
//
// Step 3 runs inline, not through the AuxiliaryCommandsAggregator as in VIP-675: the Normal Timelock holds each of
// those roles as an address(0) wildcard, which VIP-675 granted for every Spoke pool. It holds the sentinel's
// `setMarketMonitored` as a grant from VIP-680.
//
// AT EXECUTION, or the whole proposal reverts:
//  - The Atlas feed is fresh (3800s), and still authorizes ATLAS_ORACLE.
//  - ANTB has no DBO config (`MarketAlreadyInitialized`).
//  - The VTreasury holds the 0.12 ANTB seed. `withdrawTreasuryBEP20` caps at its balance and `addMarket` takes the
//    rest from the Normal Timelock, which holds no ANTB.
// ===================================================================================================

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

const antbPriceCommands = (m: AntbMarket): Command[] => [
  {
    target: ATLAS_ORACLE,
    signature: "setTokenConfigs((address,address,uint256)[])",
    params: [[[m.underlying, m.atlasFeed, ATLAS_MAX_STALE_PERIOD]]],
  },
  {
    target: RESILIENT_ORACLE,
    signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
    // Atlas as main, no pivot, no fallback, no caching.
    params: [
      [[m.underlying, [ATLAS_ORACLE, constants.AddressZero, constants.AddressZero], [true, false, false], false]],
    ],
  },
  {
    target: DEVIATION_BOUNDED_ORACLE,
    signature: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
    params: [
      [
        [
          m.underlying,
          m.dbo.cooldownPeriod,
          m.dbo.triggerThreshold,
          m.dbo.resetThreshold,
          m.dbo.enableBoundedPricing,
          m.dbo.enableCaching,
        ],
      ],
    ],
  },
];

const antbListCommands = (m: AntbMarket): Command[] => [
  {
    target: VTREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [m.underlying, m.initialSupply, NORMAL_TIMELOCK],
  },
  { target: m.underlying, signature: "approve(address,uint256)", params: [SPOKE_POOL_REGISTRY, m.initialSupply] },
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [m.vToken, m.collateralFactor, m.liquidationThreshold, m.initialSupply, SEED_RECEIVER, m.supplyCap, m.borrowCap],
    ],
  },
  { target: BSTOCK_PAUSE_SENTINEL, signature: "setMarketMonitored(address,bool)", params: [m.vToken, true] },
];

const antbSetupCommands = (m: AntbMarket): Command[] => [
  { target: m.vToken, signature: "setReduceReservesBlockDelta(uint256)", params: [REDUCE_RESERVES_BLOCK_DELTA] },
  {
    target: POOL,
    signature: "setMarketLiquidationIncentive(address,uint256)",
    params: [m.vToken, m.liquidationIncentive],
  },
  { target: m.vToken, signature: "setProtocolSeizeShare(uint256)", params: [m.protocolSeizeShare] },
  {
    target: POOL,
    signature: "setActionsPaused(address[],uint8[],bool)",
    params: [[m.vToken], [ACTION_BORROW], true],
  },
];

export const antbCommands = (m: AntbMarket): Command[] => [
  ...antbPriceCommands(m),
  ...antbListCommands(m),
  ...antbSetupCommands(m),
];

// ===================================================================================================
// Part 3: remove matured FRVs from the Liquidity Hub.
//
// All three are Matured and the Hub holds none of their shares, so `removeResource` passes its zero-balance gate.
// Their lenders can still redeem: removal only takes them off the Hub's FRV sources, the vaults stay as they are.
// ===================================================================================================

/// The USDT Hub's FRV source.
export const USDT_FRV_SOURCE = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";

export const MATURED_FRVS = [
  { name: "FRV Asseto CASH+ 13AUG2026-30", vault: "0x41179fc6ff878b7795B900888E0B61fd8029bceA", source: U_FRV_SOURCE },
  {
    name: "FRV hashglobal hBNB 05OCT2026 30",
    vault: "0xfE419E150d63ff288b9802533f6Fe2f886DB6FED",
    source: U_FRV_SOURCE,
  },
  { name: "FRV Solv BTCB 17AUG2026 30", vault: "0x086fd7972510dF9d9cFdc4efB8677fc72d290103", source: USDT_FRV_SOURCE },
];

const maturedFrvCommands: Command[] = MATURED_FRVS.map(({ vault, source }) => ({
  target: source,
  signature: "removeResource(address)",
  params: [vault],
}));

// ===================================================================================================
// Part 4: whitelist a Chainlink OEV searcher for Core Pool flash loans, as VIP-591 did for 0x82aC…5298.
//
// An ERC-1967 proxy deployed by the same address (0xede071d1…3dac38) as the VIP-591 searcher.
// ===================================================================================================

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const CHAINLINK_OEV_SEARCHER = "0xb672f0049F845fbDeCDCDdA1e8f16aaD0A094fF2";

const flashLoanCommands: Command[] = [
  {
    target: UNITROLLER,
    signature: "setWhiteListFlashLoanAccount(address,bool)",
    params: [CHAINLINK_OEV_SEARCHER, true],
  },
];

export const vip684 = () => {
  const m = ANTB_MARKET;

  const meta = {
    version: "v2",
    title:
      "VIP-684 [BNB Chain] Noon sUSN Vault Relist, ANTB bStock Listing, Matured FRV Cleanup and Chainlink OEV Searcher Whitelist",
    description: `#### Summary

If passed, this VIP will, on BNB Chain:

1. Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% margin
2. List ANTB (Anthropic bStock) as collateral in the **${MAINSTREAM_POOL_NAME}** Spoke pool
3. Remove three matured Fixed Rate Vaults from the Liquidity Hub
4. Whitelist a Chainlink OEV searcher for Core Pool flash loans

#### Part 1: Relist the Noon sUSN vault

VIP-683 listed the Noon vault with a 100% margin, so Noon had to deposit all 1,152,073.71 sUSN before it could open. Noon wants to start with a small deposit. This VIP cancels and closes that vault, which holds no collateral and no deposits, and creates a new one on the same terms with a 0.01% margin (115.207371 sUSN).

- Old vault ${OLD_NOON_VAULT}: cancelVault, removeResource from the U Hub's FRV source (${U_FRV_SOURCE}), closeVault
- New vault ${NEW_NOON_VAULT} (${VAULT_NAME}): createVault, addResource behind the AdapterFRV (${ADAPTER_FRV})
- Terms unchanged from VIP-683: U against sUSN, 6% fixed APY, up to 1,000,000 U, 1-day Open, 30-day Lock, 86% liquidation threshold
- If the collateral is incomplete when Open ends, the vault fails: lenders get their U back without interest and share the margin (≈ $143)
- Precondition: until execution, no other vault may be created for ${INSTITUTION_OPERATOR} and the vault implementation must not change

#### Part 2: List ANTB in the bStock mainstream Spoke pool

- **${m.symbol}** (${m.vToken}): collateral factor ${pct(m.collateralFactor)}, liquidation threshold ${pct(
      m.liquidationThreshold,
    )}, liquidation incentive ${pct(m.liquidationIncentive.sub(parseUnits("1", 18)))}, protocol seize share ${pct(
      m.protocolSeizeShare,
    )}, supply cap ${tokens(m.supplyCap)} ANTB, borrow cap 0 (borrowing paused), reserve factor ${pct(m.reserveFactor)}
- Seed: ${tokens(m.initialSupply)} ANTB from the Venus Treasury, vTokens to ${SEED_RECEIVER}
- Price: Atlas ${
      m.atlasFeed
    } (${ATLAS_MAX_STALE_PERIOD}s max stale) with a DeviationBoundedOracle window; APRO has no ANTB feed, so no pivot
- Monitored by the BStockPauseSentinel (${BSTOCK_PAUSE_SENTINEL})
- [vANTB_bStockMainstream deployment](https://github.com/VenusProtocol/isolated-pools/pull/590)

#### Part 3: Remove matured FRVs from the Liquidity Hub

The Hub has withdrawn from these vaults. The vaults stay as they are, so their remaining lenders can still redeem.

${MATURED_FRVS.map(
  ({ name, vault, source }) => `- ${name}: ${vault} (${source === U_FRV_SOURCE ? "U" : "USDT"} Hub)`,
).join("\n")}

#### Part 4: Whitelist a Chainlink OEV searcher

At Chainlink's request, add ${CHAINLINK_OEV_SEARCHER} to the Core Pool flash loan whitelist for OEV liquidations, as [VIP-591](https://app.venus.io/#/governance/proposal/591?chainId=56) did for Chainlink's first searcher.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "cancelVault(address)",
        params: [OLD_NOON_VAULT],
      },
      {
        target: U_FRV_SOURCE,
        signature: "removeResource(address)",
        params: [OLD_NOON_VAULT],
      },
      // After removeResource, so the vault leaves the FRV source before it is frozen. Valid only from Failed.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "closeVault(address)",
        params: [OLD_NOON_VAULT],
      },
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40)," +
          "(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_NAME, VAULT_SYMBOL, INSTITUTION_NAME],
      },
      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [NEW_NOON_VAULT, ADAPTER_FRV],
      },
      ...antbCommands(m),
      ...maturedFrvCommands,
      ...flashLoanCommands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip684;
