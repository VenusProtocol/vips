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

// 24h feed heartbeat (largest observed publish gap 86,425s) plus 1h of margin.
export const CHAINLINK_MAX_STALE_PERIOD = 90000; // 25h
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

// TODO: confirm the 13AUG2026 maturity before proposing — execution lands ~16AUG.
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

export const vip664 = (simulations = false) => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] List the Asseto CASH+ Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a new fixed-term institutional loan vault (Asseto) on the Venus Institutional Fixed Rate Vault system on BNB Chain. The institution borrows up to 500,000 U for a 30-day fixed term at a 2.7% fixed APY, collateralised by Asseto's tokenized cash-management fund token CASH+. The VIP first configures CASH+ pricing from the live Chainlink "CASH+ NAV" feed, then creates the vault and whitelists the deal's dedicated liquidator.

#### Description

**Oracle.** CASH+ is priced from the Chainlink "CASH+ NAV" feed ([${CASH_PLUS_NAV_FEED}](https://data.chain.link/feeds/bsc/mainnet/cashplus-nav)) — an 18-decimal feed reporting the fund's live net asset value in USD (~$109.28 at authoring). The feed is registered on the ChainlinkOracle and CASH+ is wired to the ResilientOracle with the ChainlinkOracle as its single main source (no pivot, no fallback, no BoundValidator), mirroring VIP-596 (XAUM). The maxStalePeriod is 25h (90,000s), giving ~1h of margin over the feed's 24h heartbeat (largest observed publish gap: 86,425s, including weekends).

**Vault terms.**

- Loan (supply) asset: U (${U})
- Collateral: CASH+ (${CASH_PLUS})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 2.7% · Reserve factor: 20%
- Borrow cap: min 1,000 U / max 500,000 U
- Open window: 7 days · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 6,101.54 CASH+ (≈ $666,663 at authoring NAV) · Margin rate: 1%
- Liquidation threshold: 85% · Liquidation incentive: 10% · Late-penalty rate: 10%

**Risk.**

- *Collateral tracks the live NAV feed.* Because CASH+ is now priced from a live feed (not a frozen/manual price), the ≈$666,663 collateral / ≈$566,663 liquidation-threshold-cap figures are a snapshot at the authoring NAV, not a fixed value. A decline in the CASH+ NAV lowers the collateral value in real time, so **a NAV drop is a live liquidation trigger** — governance does not have to re-post a price for the vault to become under-collateralised.
- *Feed staleness affects only the price-gated paths.* If the CASH+ NAV feed exceeds its 25h window, getPrice(CASH+) reverts and only the price-gated functions revert — most importantly **claimRaisedFunds** (the institution's drawdown), plus withdrawCollateral during Lock, liquidate / liquidateOverdueVault / repayBadDebt, and the liquidity views that monitoring/front-end read. Lender deposit / redeem / repay, depositCollateral and vault state advancement are unaffected. Keeping the CASH+ NAV feed publishing within its heartbeat is therefore an operational requirement for this vault.
- *Liquidation is largely market-unfillable.* 6,101.54 CASH+ is ≈74% of the total CASH+ supply, so the 10% incentive is not realistically fillable on the open market — liquidation is expected to be a guardian/settler action in practice.
- *CASH+ is pausable and has an issuer-controlled blacklist.* The token exposes \`paused()\` and \`isBlacklisted(address)\` — both false today (the deal liquidator is not blacklisted), which is why deposits work. But Asseto can unilaterally pause CASH+ transfers, or blacklist the vault or the liquidator, at any time. Any of those freezes every collateral movement: depositCollateral and withdrawCollateral, and — most importantly — the collateral-seizing leg of liquidate / liquidateOverdueVault, so a seizure could be blocked exactly when it is needed. Venus cannot override this; it is counterparty risk carried by the deal, not a protocol parameter.
- *Inverse shadow caveat.* ChainlinkOracle.prices(CASH+) must remain 0 (verified 0 today): the ChainlinkOracle returns a stored direct price whenever non-zero and never reads the feed config, so a future setDirectPrice(CASH+, …) would silently shadow this live feed until reset to 0.

**Access control.** No new AccessControlManager permissions are required — the Normal Timelock already holds createVault on the controller, setLiquidatorWhitelist on the adapter, and setTokenConfig on both oracles (granted in VIP-627 / VIP-640).

**Follow-up (out of scope).** Opening the vault after the institution deposits its margin (openVault) is a Critical Guardian multisig action and is not part of this VIP. The Critical Guardian is already whitelisted as a settler (VIP-627), so no settler command is included here.

#### Actions

1. Register the CASH+ NAV feed on the ChainlinkOracle — setTokenConfig(CASH+, feed, 25h).
2. Wire CASH+ into the ResilientOracle with the ChainlinkOracle as its single main source.
3. Create the Asseto vault on the controller — createVault(...).
4. Whitelist the deal liquidator on the LiquidationAdapter.

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
