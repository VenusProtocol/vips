import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// ===================================================================================================
// VIP-999 [BNB Chain] — Hash Global hBNB Fixed Rate Vault
// ===================================================================================================

export const { RESILIENT_ORACLE, ATLAS_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const U_FRV_SOURCE = "0x30908eddB9E94add7AC9944a0adda66d80B89143";
export const ADAPTER_FRV = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902";

export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666"; // loan (supply) asset, 18 dec
export const HBNB = "0xa1EceF1e53410202E9Eea1f8Fe4E7B1C0081f770"; // collateral, 18 dec
export const HBNB_FEED = "0xb4D69981dcD5e73e459c0740e90e10D32A4Dcf67"; // "SingleFeed hBNB/USD", 18 dec

export const HBNB_MAX_STALE_PERIOD = 3900;

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 0; re-derive if a vault is
// created for this operator before execution.
export const INSTITUTION_OPERATOR = "0xb1c92d2f514eeb0aFFd14962F840399625a85bd4";
export const HASH_GLOBAL_VAULT = "0xfE419E150d63ff288b9802533f6Fe2f886DB6FED";

export const FIXED_APY = 270; // 2.7% (bps)
export const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% -> 2.43% supply APY
export const MIN_BORROW_CAP = parseUnits("1000", 18);
export const MAX_BORROW_CAP = parseUnits("150000", 18);
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 604800; // 7 days
export const LOCK_DURATION = 2592000; // 30 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = parseUnits("198", 18);
export const MARGIN_RATE = parseUnits("0.01", 18); // 1%
export const POSITION_TOKEN_ID = 0;

export const LIQUIDATION_THRESHOLD = parseUnits("0.75", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10% bonus
export const LATE_PENALTY_RATE = parseUnits("1.1", 18); // 10% late penalty

export const VAULT_NAME = "FRV hashglobal hBNB 05OCT2026 30";
export const VAULT_SYMBOL = "FRV-hg-05OCT2026-30";
export const INSTITUTION_NAME = "Hash Global";

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
  HBNB, // collateralAsset
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

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] List the Hash Global hBNB Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a new fixed-term institutional loan vault (Hash Global) on the Venus Institutional Fixed Rate Vault system on BNB Chain. The institution borrows up to 150,000 U for a 30-day fixed term at a 2.7% fixed APY, collateralised by 198 hBNB — DigiFT's tokenized Hash Global BNB Yield Fund. The VIP first makes hBNB priceable, then creates the vault and registers it as an FRV resource on the U Liquidity Hub.

#### Description

**Oracle.** hBNB has no price configuration today — getPrice(hBNB) currently reverts. It is priced from the "SingleFeed hBNB/USD" feed ([${HBNB_FEED}](https://bscscan.com/address/${HBNB_FEED})), an 18-decimal feed reporting the fund's net asset value in USD ($1,166.824 at the deal valuation). The feed is registered on the AtlasOracle and hBNB is wired into the ResilientOracle with that oracle as its single main source — no pivot, no fallback, and therefore no BoundValidator entry — the same single-source setup used for the CASH+ and XAUM RWA collateral. The maxStalePeriod is 65 minutes (3,900s) — the feed's 1-hour heartbeat plus five minutes of tolerance. Across its history (893 rounds, 2026-08-18 to 2026-09-25) the feed published hourly with one exception, a 15.4-hour outage on 2026-09-02/03; it has not published since 2026-09-25 01:22 UTC. See the staleness risk below.

**Vault terms.**

- Loan (supply) asset: U (${U})
- Collateral: hBNB (${HBNB})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 2.7% · Reserve factor: 10% (2.43% supply APY)
- Borrow cap: min 1,000 U / max 150,000 U
- Open window: 7 days · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 198 hBNB (≈ $231,031 at the deal NAV of $1,166.824) · Margin rate: 1% (1.98 hBNB)
- Liquidation threshold: 75% · Liquidation incentive: 10% · Late-penalty rate: 10%
- Minimum supplier deposit: none

At the maximum 150,000 U drawdown the loan sits at ≈65% of the collateral's deal value, inside the 75% liquidation threshold.

**Liquidity Hub.** The vault is registered as an FRV resource on the U Hub's FRV source (${U_FRV_SOURCE}) behind the shared AdapterFRV, so the Hub Operator can allocate U into it. The FRV yield-group cap is not touched: it already stands at 90% of Hub TVL (5,000,000 U absolute), and the source currently holds no U — its only other resource, the CASH+ vault, has been fully withdrawn.

**Risk.**

- *hBNB is a permissioned security token, and the deal depends on DigiFT's transfer mode.* hBNB is a DigiFT SecurityToken whose transfers are gated by a DigiFT-controlled Management contract, now set to transferFlag == 2: a whitelisted or restricted **investor** may both initiate and receive a transfer, so one investor entry covers both directions. DigiFT has whitelisted the institution operator, the vault clone (${HASH_GLOBAL_VAULT}), the LiquidationAdapter and the Critical Guardian as investors, which covers the whole collateral path — margin and collateral in, collateral back out at maturity, and the seize-and-forward legs of a liquidation. Neither the vault nor the LiquidationAdapter is on the separate **contract** list, which is what the stricter transferFlag == 1 requires of whoever initiates a transfer. DigiFT can flip the flag back at any time, and doing so would block every collateral movement — deposit, withdrawal and seizure — until those contract-list entries are added.
- *Two hBNB recipients on edge-case paths are not whitelisted.* The ProtocolShareReserve and the U Hub cannot receive hBNB; neither does on the normal loan path. sweepProtocolShareToReserve(hBNB) on the adapter reverts, so the protocol's share of a liquidation bonus stays inside the adapter — the liquidation itself still succeeds, because that share is only booked to a counter while the liquidator's cut is paid out separately. And if the institution defaults during Fundraising — the minimum raise is reached but the full 198 hBNB is not posted when the open window closes — the vault confiscates the 1% margin (1.98 hBNB) and pays it out pro rata in hBNB on every lender withdrawal. For the Hub the recipient is the Hub itself, so the Hub Operator's reallocate out of the vault reverts and the Hub's U stays in the vault until DigiFT whitelists the Hub. The Critical Guardian avoids this case entirely by calling openVault only after the institution has posted the full 198 hBNB, which it can do in its first deposit.
- *DigiFT can freeze or migrate the collateral unilaterally.* The token exposes setPause, setTransferFlag and an upgrade path, all controlled by DigiFT's contract managers. Pausing hBNB blocks every collateral movement — deposit, withdrawal, and seizure. Venus cannot override this; it is counterparty risk, not a protocol parameter.
- *Liquidation is handled off-chain, with the Critical Guardian as the on-chain fallback.* 198 hBNB is ≈74% of the entire hBNB supply (266.087, all of it currently held by the institution operator), so the 10% incentive cannot realistically attract a third-party liquidator, and recovery from Hash Global is handled off-chain. The Critical Guardian can still liquidate on-chain through the LiquidationAdapter: it is whitelisted on the adapter for both the HF-based and the deadline-based path, and the adapter and the Guardian are both DigiFT investors, so the seized hBNB reaches it.
- *The collateral tracks a live NAV feed.* The ≈$231,031 collateral figure is a snapshot, not a fixed value. hBNB is a BNB yield fund, so its NAV moves with BNB — a decline lowers the collateral value in real time and is a live liquidation trigger without governance re-posting anything.
- *Feed staleness affects only the price-gated paths.* If the feed exceeds its 65-minute window, getPrice(hBNB) reverts and the price-gated functions revert with it — most importantly claimRaisedFunds (the institution's drawdown), plus withdrawCollateral during Lock, liquidate / liquidateOverdueVault / repayBadDebt, and the liquidity views monitoring reads. Lender deposit/redeem/repay, depositCollateral and state advancement are unaffected. The window leaves only five minutes of tolerance over the heartbeat, so a single late publication takes pricing offline until the next round. The feed's observed cadence is hourly, but it has had two outages: 15.4 hours on 2026-09-02/03, and a stop since 2026-09-25 01:22 UTC that is still ongoing at authoring. createVault prices hBNB, so this VIP reverts at execution unless the feed is publishing again by then.
- *Inverse shadow caveat.* AtlasOracle.prices(hBNB) must remain 0: a ChainlinkOracle returns a stored direct price whenever one is non-zero and never reads the feed config, so a future setDirectPrice(hBNB, …) would silently shadow this live feed until reset to 0.

**Access control.** No new AccessControlManager permissions are required. The Normal Timelock already holds createVault on the controller, setTokenConfig on both oracles, and addResource on the U FRV source (granted by earlier proposals).

**Vault open date.** This VIP only creates the vault; it does not start it. The 7-day open window and the 30-day term begin when the Critical Guardian calls openVault, once the institution has posted its collateral. The 05OCT2026 label in the vault's name and symbol therefore reflects the intended term, not a settled maturity — both are fixed at createVault and cannot be changed afterwards.

**Follow-up (out of scope).** Opening the vault (openVault) is a Critical Guardian multisig action, and whitelisting the ProtocolShareReserve or the Hub, if either edge case above ever needs it, is a DigiFT action. Neither is part of this VIP.

#### Actions

1. Register the hBNB/USD feed on the AtlasOracle — setTokenConfig(hBNB, feed, 3,900s).
2. Wire hBNB into the ResilientOracle with the AtlasOracle as its single main source.
3. Create the Hash Global vault on the controller — createVault(...).
4. Register the vault as an FRV resource on the U Hub's FRV source — addResource(vault, AdapterFRV).

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
        target: ATLAS_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[HBNB, HBNB_FEED, HBNB_MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            HBNB,
            [ATLAS_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
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

      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [HASH_GLOBAL_VAULT, ADAPTER_FRV],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
