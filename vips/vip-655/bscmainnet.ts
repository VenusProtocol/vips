import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";

export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666"; // loan (supply) asset, 18 dec
export const CASH_PLUS = "0x1775504c5873e179Ea2f8ABFcE3861EC74D159bc"; // collateral, 18 dec
export const CASH_PLUS_NAV_FEED = "0xad2388190FCDc5f1d17ef5cB3106E8b781C9193d"; // Chainlink CASH+ NAV, 18 dec

export const INSTITUTION_OPERATOR = "0x9510A850FB13FC060b50F4fD4974c5326Fd78B06";
// Deal's dedicated liquidator — whitelisted on the adapter for both liquidation paths (HF-based
// liquidate + deadline-based liquidateOverdueVault).
export const LIQUIDATOR = "0xfb4c772fe9D1FB57cf70c1aF3AD768B8e62cb8cd";

// 26h — ~41 min of margin over the largest publish gap observed across the feed's full
// 400-round history (91,123s / 25.31h, 2026-04-19 -> 2026-04-20).
export const CHAINLINK_MAX_STALE_PERIOD = 93600;
export const ONE_YEAR = 31536000; // sim-only window

export const FIXED_APY = 270; // 2.7% (bps)
export const RESERVE_FACTOR = parseUnits("0.2", 18); // 20%
export const MIN_BORROW_CAP = parseUnits("1000", 18); // 1,000 U
export const MAX_BORROW_CAP = parseUnits("500000", 18); // 500,000 U
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 604800; // 7 days
export const LOCK_DURATION = 2592000; // 30 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = parseUnits("6101.54", 18); // ≈ $666,663 at today's NAV
export const MARGIN_RATE = parseUnits("0.01", 18); // 1%
export const POSITION_TOKEN_ID = 0; // overwritten by the controller on createVault

export const LIQUIDATION_THRESHOLD = parseUnits("0.85", 18); // 85%
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10% bonus
export const LATE_PENALTY_RATE = parseUnits("1.1", 18); // 10% late penalty

// The vault open date is still TBC; name/symbol are immutable once createVault runs, so the
// 13AUG2026 label is indicative of the intended term, not of the actual open/maturity date.
export const VAULT_NAME = "FRV Asseto CASH+ 13AUG2026-30";
export const VAULT_SYMBOL = "FRV-ast-13AUG2026-30";
export const INSTITUTION_NAME = "Asseto";

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
  CASH_PLUS, // collateralAsset
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

export const vip655 = (simulations = false) => {
  const meta = {
    version: "v2",
    title: "VIP-655 [BNB Chain] List the Asseto CASH+ Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a new fixed-term institutional loan vault (Asseto) on the Venus Institutional Fixed Rate Vault system on BNB Chain. The institution borrows up to 500,000 U for a 30-day fixed term at a 2.7% fixed APY, collateralised by Asseto's tokenized cash-management fund token CASH+. The VIP first configures CASH+ pricing from the live Chainlink "CASH+ NAV" feed, then creates the vault and whitelists the deal's dedicated liquidator.

#### Description

**Oracle.** CASH+ is priced from the Chainlink "CASH+ NAV" feed ([${CASH_PLUS_NAV_FEED}](https://data.chain.link/feeds/bsc/mainnet/cashplus-nav)) — an 18-decimal feed reporting the fund's live net asset value in USD (~$109.28 at authoring). The feed is registered on the ChainlinkOracle and CASH+ is wired to the ResilientOracle with the ChainlinkOracle as its single main source (no pivot, no fallback, no BoundValidator), mirroring VIP-596 (XAUM). The maxStalePeriod is 26h (93,600s) — VIP-596's CHAINLINK_MAX_STALE_PERIOD. The feed publishes on a ~24h heartbeat; across its full history to date (400 rounds, 2025-10-18 to 2026-08-13) the largest observed publish gap is 91,123s (25.31h, 2026-04-19 to 2026-04-20), so the 26h window carries only about 41 minutes of margin over the worst case seen so far. See the staleness risk below.

**Vault terms.**

- Loan (supply) asset: U (${U})
- Collateral: CASH+ (${CASH_PLUS})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 2.7% · Reserve factor: 20%
- Borrow cap: min 1,000 U / max 500,000 U
- Open window: 7 days · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 6,101.54 CASH+ (≈ $666,663 at authoring NAV) · Margin rate: 1%
- Liquidation threshold: 85% · Liquidation incentive: 10% · Late-penalty rate: 10%
- Dedicated liquidator whitelisted on the adapter for both liquidation paths: ${LIQUIDATOR}

**Risk.**

- *Collateral tracks the live NAV feed.* Because CASH+ is now priced from a live feed (not a frozen/manual price), the ≈$666,663 collateral / ≈$566,663 liquidation-threshold-cap figures are a snapshot at the authoring NAV, not a fixed value. A decline in the CASH+ NAV lowers the collateral value in real time, so **a NAV drop is a live liquidation trigger** — governance does not have to re-post a price for the vault to become under-collateralised.
- *Feed staleness affects only the price-gated paths.* If the CASH+ NAV feed exceeds its 26h window, getPrice(CASH+) reverts and only the price-gated functions revert — most importantly **claimRaisedFunds** (the institution's drawdown), plus withdrawCollateral during Lock, liquidate / liquidateOverdueVault / repayBadDebt, and the liquidity views that monitoring/front-end read. Lender deposit / redeem / repay, depositCollateral and vault state advancement are unaffected. Keeping the CASH+ NAV feed publishing within its heartbeat is therefore an operational requirement for this vault. **The margin is thin**: the feed has already published 25.31h apart once, only ~41 minutes inside the configured window, so a single late publication can take pricing offline. The window should be reconciled against the CASH+ NAV feed's contracted heartbeat/SLA, and raised by a follow-up VIP if that SLA is looser than 26h.
- *Liquidation is largely market-unfillable.* 6,101.54 CASH+ is ≈74% of the total CASH+ supply, so the 10% incentive is not realistically fillable on the open market — liquidation is expected to be a guardian/settler action in practice.
- *CASH+ is pausable and has an issuer-controlled blacklist.* The token exposes paused() and isBlacklisted(address) — both false today, which is why deposits work. But Asseto can unilaterally pause CASH+ transfers, or blacklist the vault, at any time. Any of those freezes every collateral movement: depositCollateral and withdrawCollateral, and — most importantly — the collateral-seizing leg of liquidate / liquidateOverdueVault, so a seizure could be blocked exactly when it is needed. Venus cannot override this; it is counterparty risk carried by the deal, not a protocol parameter.
- *Inverse shadow caveat.* ChainlinkOracle.prices(CASH+) must remain 0 (verified 0 today): the ChainlinkOracle returns a stored direct price whenever non-zero and never reads the feed config, so a future setDirectPrice(CASH+, …) would silently shadow this live feed until reset to 0.

**Access control.** No new AccessControlManager permissions are required — the Normal Timelock already holds createVault on the controller, setLiquidatorWhitelist and setSettlerWhitelist on the adapter, and setTokenConfig on both oracles (granted in VIP-627 / VIP-640).

**Liquidator.** The deal's dedicated liquidator (${LIQUIDATOR}) is whitelisted on the LiquidationAdapter for **both** liquidation entry points: the HF-based liquidate (liquidator whitelist) and the deadline-based liquidateOverdueVault (settler whitelist), so it can act in both an under-collateralisation and a term-overdue scenario. The Critical Guardian remains a settler from VIP-627.

**Vault open date is TBC.** This VIP only creates the vault; it does not start it. The 7-day open window and the 30-day loan term begin only when the Critical Guardian calls openVault, after the institution has posted its margin, and that date is still to be confirmed with the counterparty. The 13AUG2026 label carried in the vault's name and symbol therefore reflects the intended term, not a settled maturity — name and symbol are fixed at createVault and cannot be changed afterwards, so if the open date moves materially the label will read stale and the vault would have to be recreated to correct it.

**Follow-up (out of scope).** Opening the vault after the institution deposits its margin (openVault) is a Critical Guardian multisig action and is not part of this VIP.

#### Actions

1. Register the CASH+ NAV feed on the ChainlinkOracle — setTokenConfig(CASH+, feed, 26h).
2. Wire CASH+ into the ResilientOracle with the ChainlinkOracle as its single main source.
3. Create the Asseto vault on the controller — createVault(...).
4. Whitelist the deal liquidator on the adapter for the HF-based path — setLiquidatorWhitelist(liquidator, true).
5. Whitelist the deal liquidator on the adapter for the overdue path — setSettlerWhitelist(liquidator, true).

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
      // Must precede createVault, which reverts unless the ResilientOracle prices CASH+.
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[CASH_PLUS, CASH_PLUS_NAV_FEED, simulations ? ONE_YEAR : CHAINLINK_MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            CASH_PLUS,
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

      // Whitelist the deal's dedicated liquidator for BOTH liquidation paths:
      //   liquidate (HF-based)            -> onlyWhitelistedLiquidator
      //   liquidateOverdueVault (deadline)-> onlyWhitelistedSettler
      {
        target: LIQUIDATION_ADAPTER,
        signature: "setLiquidatorWhitelist(address,bool)",
        params: [LIQUIDATOR, true],
      },
      {
        target: LIQUIDATION_ADAPTER,
        signature: "setSettlerWhitelist(address,bool)",
        params: [LIQUIDATOR, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip655;
