import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ADAPTERS, FRV_SOURCE_USDT } from "../vip-681/bscmainnet";

// ===================================================================================================
// VIP-684 [BNB Chain] — LTP ctBTC Fixed Rate Vault
//
// Listing doc: "[LTP] Institution fixed term vault check list" (Notion, 2026-11-16).
// ===================================================================================================

const { bscmainnet } = NETWORK_ADDRESSES;
export const {
  ACCESS_CONTROL_MANAGER,
  ATLAS_ORACLE,
  CHAINLINK_ORACLE,
  CRITICAL_GUARDIAN,
  NORMAL_TIMELOCK,
  REDSTONE_ORACLE,
  RESILIENT_ORACLE,
} = bscmainnet;
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

// VIP-681's new AdapterFRV. VIP-681 must be executed before this VIP: once it upgrades the FRV beacon, a resource
// left on the old adapter (0x1824…657c) makes the USDT Hub's totalAssets() revert.
export const ADAPTER_FRV = ADAPTERS.FRV.new;
export { FRV_SOURCE_USDT };

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";

export const USDT = "0x55d398326f99059fF775485246999027B3197955"; // loan (supply) asset, 18 dec
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";

// ctBTC ("Custodian BTC"): a CustodyReceiptToken, 18 dec, standing for BTC LTP holds in custody. Deployed by
// fixed-rate-vaults DeployCustodyReceiptToken.s.sol, which nominated the Normal Timelock as owner (block 133939405).
export const CTBTC = "0x578B847Fc479Ac4AAfA2F505BEf4f74Bf2e16228";

// ctBTC is priced exactly like BTCB: the same feed and maxStalePeriod on each of BTCB's three sub-oracles, the same
// main/pivot/fallback order on the ResilientOracle, and the same bound. Read from BTCB at block 133940210.
export const BTCB_FEEDS = [
  { oracle: CHAINLINK_ORACLE, feed: "0x8ECF7dE377F788A813F5215668E282556b35f300", maxStalePeriod: 100 },
  { oracle: REDSTONE_ORACLE, feed: "0xa51738d1937FFc553d5070f43300B385AA2D9F55", maxStalePeriod: 100 },
  { oracle: ATLAS_ORACLE, feed: "0x4f6c53fb9CdD46269d24bCa4E68bB680879132fc", maxStalePeriod: 120 },
];
export const BTCB_RESILIENT_ORACLES = [CHAINLINK_ORACLE, ATLAS_ORACLE, REDSTONE_ORACLE]; // main, pivot, fallback
export const BTCB_UPPER_BOUND = parseUnits("1.01", 18);
export const BTCB_LOWER_BOUND = parseUnits("0.99", 18);

// The ACM-gated ctBTC functions, each granted to the Normal Timelock and the Critical Guardian, as for vceBTC
// (VIP-656) and BPNC (VIP-676).
export const CTBTC_ROLES = ["mint(address,uint256)", "burn(address,uint256)", "pause()", "unpause()"];
export const CTBTC_ROLE_HOLDERS = [NORMAL_TIMELOCK, CRITICAL_GUARDIAN];

// LTP's address: receives the ctBTC and the vault's position NFT, posts the collateral and draws the loan.
export const INSTITUTION_OPERATOR = "0x76De40c1EC7Ab3c19608E687B1506a557c3b1B92";
export const CTBTC_MINT_AMOUNT = parseUnits("20", 18);

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 0; re-derive if a vault is created for
// this operator, or the vault implementation changes, before execution.
export const LTP_VAULT = "0x90D44EcC98343ab3EFE3cBf8a5f0B94A138610FA";

export const FIXED_APY = 520; // 5.2% (bps)
export const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% -> 4.68% supply APY
export const MIN_BORROW_CAP = parseUnits("10", 18);
export const MAX_BORROW_CAP = parseUnits("1000000", 18);
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 86400; // 1 day
export const LOCK_DURATION = 7776000; // 90 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = CTBTC_MINT_AMOUNT;
export const MARGIN_RATE = parseUnits("1", 18); // 100%: all collateral is posted before the vault opens
export const POSITION_TOKEN_ID = 0;

// createVault requires threshold x incentive < 1 and threshold x late penalty < 1: 0.92 x 1.08 = 0.9936.
export const LIQUIDATION_THRESHOLD = parseUnits("0.92", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.08", 18); // 8% bonus
export const LATE_PENALTY_RATE = parseUnits("1.08", 18); // 8% late penalty

export const VAULT_NAME = "FRV LTP ctBTC 20NOV2026 90";
export const VAULT_SYMBOL = "FRV-ltp-20NOV2026-90";
export const INSTITUTION_NAME = "LTP";

export const vaultConfig = [
  USDT, // supplyAsset
  FIXED_APY, // fixedAPY (bps)
  RESERVE_FACTOR, // reserveFactor
  MIN_BORROW_CAP, // minBorrowCap
  MAX_BORROW_CAP, // maxBorrowCap
  MIN_SUPPLIER_DEPOSIT, // minSupplierDeposit
  OPEN_DURATION, // openDuration
  LOCK_DURATION, // lockDuration
  SETTLEMENT_WINDOW, // settlementWindow
];
export const instConfig = [
  CTBTC, // collateralAsset
  IDEAL_COLLATERAL_AMOUNT, // idealCollateralAmount
  MARGIN_RATE, // marginRate
  INSTITUTION_OPERATOR, // institutionOperator
  POSITION_TOKEN_ID, // positionTokenId (overwritten)
];
export const riskConfig = [
  LIQUIDATION_THRESHOLD, // liquidationThreshold
  LIQUIDATION_INCENTIVE, // liquidationIncentive
  LATE_PENALTY_RATE, // latePenaltyRate
];

export const vip684 = () => {
  const meta = {
    version: "v2",
    title: "VIP-684 [BNB Chain] List the LTP ctBTC Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a fixed-term institutional loan vault for LTP on the Venus Institutional Fixed Rate Vault system on BNB Chain. The vault allows LTP to borrow up to 1,000,000 USDT for 90 days at a 5.2% fixed APY, collateralised by 20 BTC held in custody. The VIP onboards **ctBTC** ("Custodian BTC"), a governance-controlled receipt token for that BTC priced identically to BTCB, mints the 20 ctBTC to LTP, creates the vault and registers it on the USDT Liquidity Hub.

#### Description

**ctBTC.** ctBTC ([${CTBTC}](https://bscscan.com/address/${CTBTC})) is a CustodyReceiptToken, the contract behind vceBTC (VIP-656) and BPNC (VIP-676): an 18-decimal ERC-20 whose mint, burn, pause and unpause are gated by the Access Control Manager. Pausing stops holder-to-holder transfers, so while ctBTC is paused no collateral can be posted to or withdrawn from the vault, no liquidation can seize it and the protocol's share cannot be swept to the ProtocolShareReserve. Minting and burning still work. The VIP accepts its ownership for the Normal Timelock and grants all four functions to the Normal Timelock and the Critical Guardian. It then mints 20 ctBTC to LTP (${INSTITUTION_OPERATOR}), the whole supply.

**Oracle.** ctBTC reads BTCB's price sources: the same feed and maximum stale period on the Chainlink, RedStone and Atlas oracles, the same ResilientOracle order (Chainlink main, Atlas pivot, RedStone fallback) and the same 1% BoundValidator band. ctBTC therefore returns the BTCB price.

**Vault terms.**

- Vault: ${LTP_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan (supply) asset: USDT (${USDT})
- Collateral: ctBTC (${CTBTC})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 5.2% · Reserve factor: 10% (4.68% supply APY)
- Borrow cap: min 10 USDT / max 1,000,000 USDT · Minimum supplier deposit: none
- Open window: 1 day · Lock (loan term): 90 days · Settlement window: 3 days
- Ideal collateral: 20 ctBTC (≈ $1,428,570 at the deal price of $71,428.5) · Margin rate: 100%
- Liquidation threshold: 92% · Liquidation incentive: 8% · Late-penalty rate: 8%

At the maximum 1,000,000 USDT drawdown the loan is ≈70% of the collateral's deal value. With the 90-day coupon the debt is ≈1,012,822 USDT, which reaches the 92% liquidation threshold at a BTC price of ≈$55,045. The 85% margin call (≈$59,578) is an off-chain monitoring threshold with no on-chain parameter. BTC has fallen since the deal: at the ≈$64,026 price at authoring, the 20 ctBTC are worth ≈$1.28M, so that debt is ≈79.1% of the collateral: the margin call is a ≈6.9% BTC fall away and liquidation a ≈14.0% fall.

**Liquidity Hub.** The vault is added as a resource on the USDT Hub's FRV source (${FRV_SOURCE_USDT}) behind the shared AdapterFRV (${ADAPTER_FRV}), so the Hub Operator can allocate USDT into it.

**Considerations.**

- **ctBTC is only as good as the custody behind it.** Its price is BTCB's, but nothing on chain links it to the BTC LTP holds. Governance and the Critical Guardian can mint ctBTC, burn it from any holder and pause its transfers.
- **100% margin.** LTP posts all 20 ctBTC before the Critical Guardian calls openVault, so the vault cannot fail for a collateral shortfall.
- **Liquidation incentive split.** Half of the 8% incentive goes to the protocol: the LiquidationAdapter's protocolLiquidationShare is already 50% for all vaults.
- **Liquidators.** The LiquidationAdapter's whitelists cover every institutional vault. Today the Critical Guardian and VIP-655's Asseto liquidator (0xfb4c772fe9D1FB57cf70c1aF3AD768B8e62cb8cd) are on them; VIP-682 adds the liquidator bot and the Venus Operational Fund Multisig.

**Access control.** The Normal Timelock already holds setTokenConfig on the four oracles, setValidateConfig on the BoundValidator, createVault on the controller and addResource on the USDT FRV source. The only new permissions are the eight ctBTC grants.

This VIP depends on VIP-681, which must be executed first: it replaces the AdapterFRV that the vault is registered with.

#### Actions

1. Register ctBTC on the Chainlink, RedStone and Atlas oracles with BTCB's feeds: setTokenConfig on each.
2. Apply BTCB's 1% bound to ctBTC on the BoundValidator (${BOUND_VALIDATOR}).
3. Price ctBTC on the ResilientOracle (${RESILIENT_ORACLE}) with Chainlink, Atlas and RedStone as main, pivot and fallback.
4. Accept ownership of ctBTC for the Normal Timelock.
5. Grant mint, burn, pause and unpause on ctBTC to the Normal Timelock and the Critical Guardian.
6. Mint 20 ctBTC to LTP (${INSTITUTION_OPERATOR}).
7. Create the LTP vault on the InstitutionalVaultController (${INSTITUTIONAL_VAULT_CONTROLLER}): createVault(...).
8. Register the vault as a resource on the USDT Hub's FRV source (${FRV_SOURCE_USDT}): addResource(${LTP_VAULT}, ${ADAPTER_FRV}).

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
      // Must precede createVault, which reverts unless the ResilientOracle prices ctBTC.
      ...BTCB_FEEDS.map(({ oracle, feed, maxStalePeriod }) => ({
        target: oracle,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[CTBTC, feed, maxStalePeriod]],
      })),
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[CTBTC, BTCB_UPPER_BOUND, BTCB_LOWER_BOUND]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[CTBTC, BTCB_RESILIENT_ORACLES, [true, true, true], false]],
      },

      { target: CTBTC, signature: "acceptOwnership()", params: [] },
      ...CTBTC_ROLE_HOLDERS.flatMap(account =>
        CTBTC_ROLES.map(role => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [CTBTC, role, account],
        })),
      ),
      {
        target: CTBTC,
        signature: "mint(address,uint256)",
        params: [INSTITUTION_OPERATOR, CTBTC_MINT_AMOUNT],
      },

      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40)," +
          "(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_NAME, VAULT_SYMBOL, INSTITUTION_NAME],
      },

      {
        target: FRV_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [LTP_VAULT, ADAPTER_FRV],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip684;
