import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ADAPTERS } from "../vip-681/bscmainnet";

// ===================================================================================================
// VIP-682 [BNB Chain] — Noon Capital sUSN Fixed Rate Vault
// ===================================================================================================

export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;
// VIP-681's new AdapterFRV. VIP-681 must be proposed and executed before this VIP: once it upgrades the FRV
// beacon, a resource left on the old adapter (0x1824…657c) makes the U Hub's totalAssets() revert.
export const ADAPTER_FRV = ADAPTERS.FRV.new;

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";
export const U_FRV_SOURCE = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666"; // loan (supply) asset, 18 dec
export const SUSN = "0xdA67B4284609d2d48e5d10cfAc411572727dc1eD"; // collateral, Hyperlane-bridged Staked USN, 18 dec

// Stork's on-chain verifier and the sUSN feed it stores: the sUSN -> USN exchange rate, 18 dec, pushed hourly.
export const STORK = "0x7D06cc8210228365896A3cc8Aac88c5551529112";
export const SUSN_STORK_FEED_ID = "0x77003d6da8f95711efa901495c607c987dfaedd55d24c6f935286f2851ed915e";
// PENDING: the Chainlink-interface adapter over (STORK, SUSN_STORK_FEED_ID) that reports updatedAt in seconds.
// Stork's own StorkChainlinkAdapter reports nanoseconds, which the ChainlinkOracle rejects. This placeholder
// has no code on BNB Chain, so a proposal built with it reverts at createVault.
export const SUSN_STORK_FEED = "0x4054d459d804612a60b282ae6EA91dfFbd7A03eC";
// 1h + 5min: the feed is pushed hourly; its oldest value before a push was 3,700s (Sept 10 - Nov 13).
export const MAX_STALE_PERIOD = 3900;

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 0; re-derive if a vault is
// created for this operator, or the vault implementation changes, before execution.
export const INSTITUTION_OPERATOR = "0x7e03eA3852489D3A3326ac51c1f81dFd8b1d3705";
export const NOON_VAULT = "0x6859D261da1eF6D7dBdB1AE612B358b881346B12";

// Whitelisted on the adapter for both liquidation paths, for every institutional vault.
export const LIQUIDATOR_BOT = "0x95780F943b6361FB11eEd893cf1237Dd9B3F54AF";
export const OPS_FUND_MULTISIG = "0xdc6E047f665c3Db94292Bb7fB412B25370db2029"; // Venus Operational Fund Multisig

export const FIXED_APY = 600; // 6% (bps)
export const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% -> 5.4% supply APY
export const MIN_BORROW_CAP = parseUnits("10", 18);
export const MAX_BORROW_CAP = parseUnits("1000000", 18);
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 86400; // 1 day
export const LOCK_DURATION = 2592000; // 30 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = parseUnits("1152073.71", 18);
export const MARGIN_RATE = parseUnits("1", 18); // 100%: all collateral is posted before the vault opens
export const POSITION_TOKEN_ID = 0;

export const LIQUIDATION_THRESHOLD = parseUnits("0.86", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10% bonus
export const LATE_PENALTY_RATE = parseUnits("1.1", 18); // 10% late penalty

export const VAULT_NAME = "FRV Noon sUSN 16NOV2026 30";
export const VAULT_SYMBOL = "FRV-nn-16NOV2026-30";
export const INSTITUTION_NAME = "Noon Capital";

export const vaultConfig = [
  U, // supplyAsset
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
  SUSN, // collateralAsset
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

export const vip682 = () => {
  const meta = {
    version: "v2",
    title: "VIP-682 [BNB Chain] List the Noon Capital sUSN Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a fixed-term institutional loan vault for Noon Capital on the Venus Institutional Fixed Rate Vault system on BNB Chain. The vault allows the institution to borrow up to 1,000,000 U for 30 days at a 6% fixed APY, collateralised by 1,152,073.71 sUSN (Staked USN). The VIP prices sUSN from a Stork feed, creates the vault, whitelists two liquidators and registers the vault on the U Liquidity Hub.

#### Description

**Oracle.** sUSN is new to Venus. It is priced from Stork's sUSN feed (ID ${SUSN_STORK_FEED_ID}) on the Stork contract [${STORK}](https://bscscan.com/address/${STORK}). The feed reports the sUSN to USN exchange rate of the Staked USN vault on Ethereum, ≈1.2365 at authoring, and is pushed hourly. A Chainlink-interface adapter, [${SUSN_STORK_FEED}](https://bscscan.com/address/${SUSN_STORK_FEED}), reads the feed for the ChainlinkOracle, which becomes sUSN's single ResilientOracle source (no pivot, no fallback). The maxStalePeriod is 1 hour 5 minutes (3,900s); the feed's oldest value before an update was 3,700s from September 10 to November 13, 2026.

**Vault terms.**

- Vault: ${NOON_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan (supply) asset: U (${U})
- Collateral: sUSN (${SUSN})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 6% · Reserve factor: 10% (5.4% supply APY)
- Borrow cap: min 10 U / max 1,000,000 U · Minimum supplier deposit: none
- Open window: 1 day · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 1,152,073.71 sUSN (≈ $1,428,571 at the deal price of $1.24) · Margin rate: 100%
- Liquidation threshold: 86% · Liquidation incentive: 10% · Late-penalty rate: 10%

At the maximum 1,000,000 U drawdown the loan is ≈70% of the collateral's deal value. With the 30-day coupon the debt is ≈1,004,932 U, which reaches the 86% liquidation threshold if the sUSN price falls ≈18% from its authoring value, to ≈$1.014. The 80% margin call (≈$1.090, a ≈11.8% fall) is an off-chain monitoring threshold with no on-chain parameter.

**Liquidators.** The LiquidationAdapter (${LIQUIDATION_ADAPTER}) whitelists the deal's liquidator bot (${LIQUIDATOR_BOT}) and the Venus Operational Fund Multisig (${OPS_FUND_MULTISIG}) for both the health-factor path (liquidate) and the overdue path (liquidateOverdueVault). The whitelist covers every institutional vault on the adapter, not only this one. The Critical Guardian remains whitelisted for both.

**Liquidity Hub.** The vault is added as a resource on the U Hub's FRV source (${U_FRV_SOURCE}) behind the shared AdapterFRV (${ADAPTER_FRV}), so the Hub Operator can allocate U into it.

**Considerations.**

- **The oracle tracks the exchange rate, not the market.** USN is valued at $1, so a USN depeg would not lower sUSN's price on Venus. Noon Capital both issues sUSN and borrows against it.
- **Price-gated actions need fresh pushes.** If the feed goes more than 3,900s without an update, getPrice(sUSN) reverts, and with it the institution's drawdown (claimRaisedFunds), withdrawCollateral during Lock, and both liquidation paths. Deposits, redemptions, repayment and state updates are unaffected.
- **100% margin.** The institution posts all 1,152,073.71 sUSN before the Critical Guardian calls openVault, so the vault cannot fail for a collateral shortfall.
- **sUSN is pausable and has an issuer blacklist.** Noon's admin can pause sUSN transfers on BNB Chain or blacklist any address, the vault's included, which would block collateral deposits, withdrawals and seizures. sUSN on BNB Chain is bridged from Ethereum over Hyperlane, and had no supply on BNB Chain at authoring.
- **Liquidation incentive split.** Half of the 10% incentive goes to the protocol: the LiquidationAdapter's protocolLiquidationShare is already 50% for all vaults.

**Access control.** No new permissions are required: the Normal Timelock already holds setTokenConfig on both oracles, createVault on the controller, setLiquidatorWhitelist and setSettlerWhitelist on the adapter, and addResource on the U FRV source.

#### Actions

1. Register the sUSN Stork adapter on the ChainlinkOracle (${CHAINLINK_ORACLE}): setTokenConfig(sUSN, ${SUSN_STORK_FEED}, 3900).
2. Price sUSN on the ResilientOracle (${RESILIENT_ORACLE}) with the ChainlinkOracle as its single main source.
3. Create the Noon Capital vault on the InstitutionalVaultController (${INSTITUTIONAL_VAULT_CONTROLLER}): createVault(...).
4. Whitelist the liquidator bot and the Venus Operational Fund Multisig on the LiquidationAdapter: setLiquidatorWhitelist and setSettlerWhitelist for each.
5. Register the vault as a resource on the U Hub's FRV source (${U_FRV_SOURCE}): addResource(${NOON_VAULT}, ${ADAPTER_FRV}).

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
      // Must precede createVault, which reverts unless the ResilientOracle prices sUSN.
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[SUSN, SUSN_STORK_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            SUSN,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40)," +
          "(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_NAME, VAULT_SYMBOL, INSTITUTION_NAME],
      },

      // liquidate (health factor) is gated by the liquidator whitelist, liquidateOverdueVault by the settler one.
      ...[LIQUIDATOR_BOT, OPS_FUND_MULTISIG].flatMap(liquidator => [
        {
          target: LIQUIDATION_ADAPTER,
          signature: "setLiquidatorWhitelist(address,bool)",
          params: [liquidator, true],
        },
        {
          target: LIQUIDATION_ADAPTER,
          signature: "setSettlerWhitelist(address,bool)",
          params: [liquidator, true],
        },
      ]),

      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [NOON_VAULT, ADAPTER_FRV],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip682;
