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

This VIP lists a fixed-term institutional loan vault for Hash Global on the Venus Institutional Fixed Rate Vault system on BNB Chain. The institution borrows up to 150,000 U for 30 days at a 2.7% fixed APY, collateralised by 198 hBNB, DigiFT's tokenized Hash Global BNB Yield Fund. The VIP makes hBNB priceable, creates the vault and registers it on the U Liquidity Hub.

#### Description

**Oracle.** hBNB is priced from the "SingleFeed hBNB/USD" NAV feed ([${HBNB_FEED}](https://bscscan.com/address/${HBNB_FEED})) through the AtlasOracle, which becomes hBNB's only source on the ResilientOracle (no pivot or fallback). The maxStalePeriod is 65 minutes: the feed's 1-hour heartbeat plus five minutes.

**Vault terms.**

- Vault: ${HASH_GLOBAL_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan (supply) asset: U (${U})
- Collateral: hBNB (${HBNB})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 2.7% · Reserve factor: 10% (2.43% supply APY)
- Borrow cap: min 1,000 U / max 150,000 U · Minimum supplier deposit: none
- Open window: 7 days · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 198 hBNB (≈ $231,031 at the deal NAV of $1,166.824) · Margin rate: 1% (1.98 hBNB)
- Liquidation threshold: 75% · Liquidation incentive: 10% · Late-penalty rate: 10%

At the maximum 150,000 U drawdown the loan is ≈65% of the collateral's deal value, inside the 75% liquidation threshold.

**Liquidity Hub.** The vault is added as a resource on the U Hub's FRV source (${U_FRV_SOURCE}) behind the shared AdapterFRV, so the Hub Operator can allocate U into it.

**Considerations.**

- *hBNB is a permissioned token.* DigiFT gates every hBNB transfer. Under its current transfer mode, the institution operator and the vault are whitelisted for collateral in and out, and the LiquidationAdapter and Critical Guardian for liquidation. DigiFT can pause hBNB or change its transfer mode at any time.
- *Liquidation is handled off-chain.* The 198 hBNB is most of the hBNB supply, so an open-market liquidation is not realistic. The Critical Guardian can still liquidate on-chain through the LiquidationAdapter as a fallback.
- *Open only once the full collateral is posted.* If fundraising ends with less than 198 hBNB posted, the margin is confiscated and paid to lenders in hBNB, which lenders that are not DigiFT investors (including the U Hub) cannot receive. The Critical Guardian should call openVault only after all 198 hBNB is posted.
- *Fresh price required.* createVault and the institution's drawdown read the hBNB price, so they revert while the feed is outside its 65-minute window.

**Access control.** No new permissions are required: the Normal Timelock already holds createVault on the controller, setTokenConfig on both oracles, and addResource on the U FRV source.

#### Actions

1. Register the hBNB/USD feed on the AtlasOracle: setTokenConfig(hBNB, feed, 3,900s).
2. Set the AtlasOracle as hBNB's only source on the ResilientOracle.
3. Create the Hash Global vault on the controller: createVault(...).
4. Register the vault as a resource on the U Hub's FRV source: addResource(vault, AdapterFRV).

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
