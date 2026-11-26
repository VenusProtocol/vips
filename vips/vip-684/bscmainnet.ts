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
  U,
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
// VIP-684 [BNB Chain], two independent parts, all from the Normal Timelock:
//  1. Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% margin.
//  2. List ANTB as collateral in the bStock mainstream Spoke pool.
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

export const vip684 = () => {
  const m = ANTB_MARKET;

  const meta = {
    version: "v2",
    title:
      "VIP-684 [BNB Chain] Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% Margin, and List ANTB in the bStock Mainstream Spoke Pool",
    description: `#### Summary

If passed, this VIP will, on BNB Chain:

1. Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% margin.
2. List ANTB (Anthropic bStock) as collateral in the **${MAINSTREAM_POOL_NAME}** Hub-Funded Spoke pool, which VIP-675 created.

The two parts are independent.

### Part 1: Relist the Noon Capital sUSN vault with a 0.01% margin

VIP-683 listed a 30-day fixed-term vault for Noon Capital with a 100% margin, so Noon had to deposit all 1,152,073.71 sUSN before the vault could open. Noon wants to open it with a small deposit. This VIP cancels and closes that vault, which holds no collateral and no deposits, and lists a new one on the same terms with a 0.01% margin.

#### Margin

- Margin rate: 100% → 0.01%, so the margin is ${MARGIN_AMOUNT.toString()} wei (115.207371 sUSN, ≈ $143 at $1.24).
- Noon deposits the margin, governance opens the vault, and Noon deposits the rest of the 1,152,073.71 sUSN during the 1-day Open period.
- If lenders supply at least the 10 U minimum but the collateral is not complete when the Open period ends, the vault fails. Lenders get their U back without interest, and the 115.207371 sUSN margin is shared among them pro rata.

**Trade-off.** At 0.01% the lenders' protection on a failed vault is about $143, against up to 1,000,000 U left idle for the Open day. Noon asked for it so it can start with a small deposit, and the team accepted that trade. If the U Hub is the lender, its share of the sUSN lands in the Hub contract, outside the Hub's share price; only a Normal Timelock VIP can sweep it out.

#### New vault

- Vault: ${NEW_NOON_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan asset: U (${U}) · Collateral: sUSN (${SUSN})
- Institution operator: ${INSTITUTION_OPERATOR} · Institution: ${INSTITUTION_NAME}
- Fixed APY: 6% · Reserve factor: 10% (5.4% supply APY)
- Borrow cap: min 10 U / max 1,000,000 U · Minimum supplier deposit: none
- Open: 1 day · Lock: 30 days · Settlement window: 3 days
- Collateral: 1,152,073.71 sUSN (≈ $1,428,571 at $1.24) · Margin rate: 0.01%
- Liquidation threshold: 86% · Liquidation incentive: 10% · Late penalty: 10%

Unchanged from VIP-683: the sUSN price from the Stork feed, and the liquidator bot and the Venus Operational Fund Multisig whitelisted on the LiquidationAdapter for every institutional vault.

#### Execution precondition

The new vault's address is predicted from the operator's vault count and the controller's vault implementation. Until this VIP executes, no other vault may be created for ${INSTITUTION_OPERATOR} and the vault implementation must not change; either would make step 5 of Part 1 revert, and the whole VIP with it.

#### Actions (Part 1)

1. Cancel the VIP-683 vault ${OLD_NOON_VAULT} on the InstitutionalVaultController (${INSTITUTIONAL_VAULT_CONTROLLER}): cancelVault. It moves to Failed; there is no collateral to refund.
2. Remove it from the U Hub's FRV source (${U_FRV_SOURCE}): removeResource.
3. Close it on the InstitutionalVaultController: closeVault. Failed → Closed, the terminal delisted state that blocks every operation on the vault.
4. Create the new vault on the InstitutionalVaultController: createVault(...).
5. Register the new vault on the U Hub's FRV source behind the AdapterFRV ${ADAPTER_FRV}: addResource.

### Part 2: List ANTB in the bStock mainstream Spoke pool

Anyone may supply ANTB and use it as collateral. It is not borrowable.

#### Proposed changes (Part 2)

1. Price ANTB with Atlas as the main oracle and a DeviationBoundedOracle window. APRO has no ANTB feed on BNB Chain, so there is no pivot.
2. List the market, seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}, and add it to the markets the BStockPauseSentinel (${BSTOCK_PAUSE_SENTINEL}) monitors.
3. Give the market a liquidation incentive of its own, set its protocol seize share, and pause borrowing on it.

#### Market parameters

- **${m.symbol}**: collateral factor ${pct(m.collateralFactor)}, liquidation threshold ${pct(
      m.liquidationThreshold,
    )}, liquidation incentive ${pct(m.liquidationIncentive.sub(parseUnits("1", 18)))}, protocol seize share ${pct(
      m.protocolSeizeShare,
    )}, supply cap ${tokens(m.supplyCap)} ANTB, borrow cap 0, reserve factor ${pct(m.reserveFactor)}, seed ${tokens(
      m.initialSupply,
    )} ANTB
- ANTB charges no interest.
- The market sends its reserves to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks, as the pool's other markets do.

#### Pricing

- Atlas ${m.atlasFeed} (${ATLAS_MAX_STALE_PERIOD}s max stale period), no pivot.
- DeviationBoundedOracle window: a 1 hour cooldown, a 12.5% trigger and a 5% reset, as on the pool's other new assets.

#### Notes

- Liquidations are permissionless. The pool's liquidation allowlist stays off.
- If ANTB's issuer pauses the token, or its compliance module blocks the market, a keeper can have the BStockPauseSentinel set the market's collateral factor to 0 through EBrake. The liquidation threshold stays, so no position becomes liquidatable.

#### Deployed contracts

- ${m.symbol}: ${m.vToken}
- ANTB: ${m.underlying}

#### References

- [VIP-675: the bStock mainstream Spoke pool](https://app.venus.io/#/governance/proposal/675?chainId=56)
- [vANTB_bStockMainstream deployment](https://github.com/VenusProtocol/isolated-pools/pull/590)

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip684;
