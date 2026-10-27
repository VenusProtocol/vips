import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ADAPTER_FRV } from "../vip-669/addresses/bscmainnet";

// ===================================================================================================
// VIP-674 [BNB Chain] — Octagon SolvBTC Fixed Rate Vault
// ===================================================================================================

export const { RESILIENT_ORACLE } = NETWORK_ADDRESSES.bscmainnet;
export { ADAPTER_FRV }; // VIP-669's AdapterFRV, which the live U FRV resources use

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const U_FRV_SOURCE = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666"; // loan (supply) asset, 18 dec
export const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7"; // collateral, 18 dec

// SolvBTC's existing ResilientOracle sources, unchanged by this VIP.
export const SOLVBTC_MAIN_ORACLE = "0x3f4bC081E749032cffF29dcA2E8408Ec375e745A"; // OneJumpOracle (Chainlink SolvBTC/BTC x BTC/USD)
export const SOLVBTC_PIVOT_ORACLE = "0x1f785B1AFE0808d69d1188db9e47b7B9Dd95ab09"; // CorrelatedTokenOracle (fundamental rate)

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 0; re-derive if a vault is
// created for this operator, or the vault implementation changes, before execution.
export const INSTITUTION_OPERATOR = "0x490Dc69d47061CDb6Be9Aff67E93fE454d62BE72";
export const OCTAGON_VAULT = "0x19209BfF412472c203892Edf0C9F0320498d9bD7";

export const FIXED_APY = 400; // 4% (bps)
export const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% -> 3.6% supply APY
export const MIN_BORROW_CAP = parseUnits("100", 18);
export const MAX_BORROW_CAP = parseUnits("2000000", 18);
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 86400; // 1 day
export const LOCK_DURATION = 2592000; // 30 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = parseUnits("33.41", 18);
export const MARGIN_RATE = parseUnits("0.005", 18); // 0.5%
export const POSITION_TOKEN_ID = 0;

export const LIQUIDATION_THRESHOLD = parseUnits("0.85", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10% bonus
export const LATE_PENALTY_RATE = parseUnits("1.1", 18); // 10% late penalty

export const VAULT_NAME = "FRV Octagon solvBTC 29OCT2026 30";
export const VAULT_SYMBOL = "FRV-og-29OCT2026-30";
export const INSTITUTION_NAME = "Solv (Octagon Digital Asset Ltd.)";

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
  SOLVBTC, // collateralAsset
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

export const vip674 = () => {
  const meta = {
    version: "v2",
    title: "VIP-674 [BNB Chain] List the Octagon SolvBTC Fixed-Term Institutional Loan Vault",
    description: `#### Summary

This VIP lists a fixed-term institutional loan vault for Octagon Digital Asset Ltd. on the Venus Institutional Fixed Rate Vault system on BNB Chain. The vault allows the institution to borrow up to 2,000,000 U for 30 days at a 4% fixed APY, collateralised by 33.41 SolvBTC. The VIP creates the vault and registers it on the U Liquidity Hub.

#### Description

**Oracle.** No change. SolvBTC is already priced on the ResilientOracle for the Core Pool vSolvBTC market: main oracle [${SOLVBTC_MAIN_ORACLE}](https://bscscan.com/address/${SOLVBTC_MAIN_ORACLE}) (Chainlink SolvBTC/BTC exchange rate × BTC/USD), pivot [${SOLVBTC_PIVOT_ORACLE}](https://bscscan.com/address/${SOLVBTC_PIVOT_ORACLE}) (fundamental rate).

**Vault terms.**

- Vault: ${OCTAGON_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan (supply) asset: U (${U})
- Collateral: SolvBTC (${SOLVBTC})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 4% · Reserve factor: 10% (3.6% supply APY)
- Borrow cap: min 100 U / max 2,000,000 U · Minimum supplier deposit: none
- Open window: 1 day · Lock (loan term): 30 days · Settlement window: 3 days
- Ideal collateral: 33.41 SolvBTC (≈ $2,670,161 at the deal price of $79,921) · Margin rate: 0.5% (0.16705 SolvBTC)
- Liquidation threshold: 85% · Liquidation incentive: 10% · Late-penalty rate: 10%

At the maximum 2,000,000 U drawdown the loan is ≈75% of the collateral's deal value. With the 30-day coupon the debt is ≈2,006,575 U, which reaches the 85% liquidation threshold if SolvBTC falls ≈11.6% from the deal price, to ≈$70,660. The 80% margin call (≈$75,070, a ≈6.1% fall) is an off-chain monitoring threshold with no on-chain parameter.

**Liquidity Hub.** The vault is added as a resource on the U Hub's FRV source (${U_FRV_SOURCE}) behind the shared AdapterFRV (${ADAPTER_FRV}), so the Hub Operator can allocate U into it.

**Considerations.**

- **Liquidation incentive split.** Half of the 10% incentive goes to the protocol: the LiquidationAdapter's protocolLiquidationShare is already 50% for all vaults, so no change is needed.
- **One-day open window.** Earlier vaults were open for 7 days. If the window closes with the minimum raised but less than 33.41 SolvBTC posted, the margin is confiscated and paid to lenders in SolvBTC, the U Hub included. The Critical Guardian should call openVault only after all 33.41 SolvBTC is posted. Any SolvBTC the Hub receives can be recovered through its governance sweep.
- **SolvBTC has an issuer blacklist.** Solv's blacklist manager can block transfers from any address, the vault's included.

**Access control.** No new permissions are required: the Normal Timelock already holds createVault on the controller and addResource on the U FRV source.

#### Actions

1. Create the Octagon vault on the controller: createVault(...).
2. Register the vault as a resource on the U Hub's FRV source: addResource(vault, AdapterFRV).

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
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40)," +
          "(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_NAME, VAULT_SYMBOL, INSTITUTION_NAME],
      },

      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [OCTAGON_VAULT, ADAPTER_FRV],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip674;
