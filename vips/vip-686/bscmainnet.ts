import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

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

// ===================================================================================================
// VIP-686 [BNB Chain] Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% margin
//
// VIP-683 created the Noon vault with a 100% margin: Noon had to deposit all 1,152,073.71 sUSN before the
// vault could open. Noon wants to open it with a small deposit, so this VIP cancels that vault and creates
// a new one on the same terms with a 0.01% margin.
// ===================================================================================================

// The VIP-683 vault. Still in WaitingForMargin, with no collateral and no shares.
export const OLD_NOON_VAULT = NOON_VAULT;

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 1; re-derive if another vault is
// created for this operator, or the vault implementation changes, before execution.
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

export const vip686 = () => {
  const meta = {
    version: "v2",
    title: "VIP-686 [BNB Chain] Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% Margin",
    description: `#### Summary

VIP-683 listed a 30-day fixed-term vault for Noon Capital with a 100% margin, so Noon had to deposit all 1,152,073.71 sUSN before the vault could open. Noon wants to open it with a small deposit. This VIP cancels that vault, which holds no collateral and no deposits, and lists a new one on the same terms with a 0.01% margin.

#### Margin

- Margin rate: 100% → 0.01%, so the margin is ${MARGIN_AMOUNT.toString()} wei (115.207371 sUSN, ≈ $143 at $1.24).
- Noon deposits the margin, governance opens the vault, and Noon deposits the rest of the 1,152,073.71 sUSN during the 1-day Open period.
- If lenders supply at least the 10 U minimum but the collateral is not complete when the Open period ends, the vault fails. Lenders get their U back without interest, and the 115.207371 sUSN margin is confiscated for them.

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

#### Actions

1. Cancel the VIP-683 vault ${OLD_NOON_VAULT} on the InstitutionalVaultController (${INSTITUTIONAL_VAULT_CONTROLLER}): cancelVault. It moves to Failed; there is no collateral to refund.
2. Remove it from the U Hub's FRV source (${U_FRV_SOURCE}): removeResource.
3. Create the new vault on the InstitutionalVaultController: createVault(...).
4. Register the new vault on the U Hub's FRV source behind the AdapterFRV ${ADAPTER_FRV}: addResource.

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip686;
