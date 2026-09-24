import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===== Treasury =====
export const VTREASURY = bscmainnet.VTREASURY;

// Finance-controlled multisig (BNB Safe) — destination for the swept funds.
export const FINANCE_MULTISIG = "0xdc6E047f665c3Db94292Bb7fB412B25370db2029";

// ===== Tokens (bscmainnet, both 18 decimals) =====
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// ===== Sweep amounts =====
export const USDT_AMOUNT = parseUnits("480000", 18);
export const USDC_AMOUNT = parseUnits("720000", 18);

export const vip631 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-631 [BNB Chain] Liquidity Reserve — Institutional Fixed Rate Vault Backstop & Bstock Liquidation Buffer",
    description: `This proposal establishes a Liquidity Reserve funded from the Venus Treasury to put idle treasury stablecoins to productive use on BNB Chain: backstopping the Institutional Fixed Rate Vault to earn interest, and providing a liquidation buffer for Bstock.

#### Background

The Venus Treasury holds idle USDT and USDC that currently earn no yield. This proposal moves a portion into a dedicated, treasury-owned Liquidity Reserve so it can be deployed productively while also serving two needs:

- **Institutional Fixed Rate Vault backstop** — When the Institutional Fixed Rate Vault opens for subscription, the institutional allocation may not fill to target by the end of the subscription window. The Liquidity Reserve fills any shortfall so the vault launches at full size — and in doing so earns the vault's fixed interest on the capital it supplies.
- **Bstock liquidation buffer** — During weekends and low-liquidity windows, large liquidations may need to be settled on-chain before the recovered collateral can be sold on a CEX. A standing buffer lets the team front this capital and complete liquidations promptly, then replenish the buffer after the CEX sell-down.

#### Details

- **Vault backstop ($1,000,000):** If the institutional subscription does not reach target, the Liquidity Reserve supplies the shortfall so the vault launches at full size. The capital supplied earns the vault's fixed rate. Interest accrues to the Liquidity Reserve and compounds: on each subsequent vault cycle the capital — now larger — is redeployed to fill shortfalls again, steadily growing the reserve.
- **Bstock buffer ($200,000):** A revolving buffer used to front weekend/low-liquidity liquidations on-chain, replenished after each CEX sell-down.
- The reserve is held in a dedicated protocol-owned multisig. Principal and all accrued interest remain in the reserve and are redeployed each cycle.

#### Summary

If approved, this VIP will:

- Transfer 480,000 USDT and 720,000 USDC (1.2M total) from the Venus Treasury into the Liquidity Reserve.
- Deploy $1,000,000 as the Institutional Fixed Rate Vault subscription backstop and $200,000 as the Bstock liquidation buffer.
- Retain principal and accrued interest in the Liquidity Reserve to compound across cycles, generating ongoing yield on otherwise-idle treasury capital.

#### Actions

This VIP performs the following 2 actions on BNB Chain:

- **Withdraw USDT** — Calls withdrawTreasuryBEP20(${USDT}, ${USDT_AMOUNT}, ${FINANCE_MULTISIG}) on the [Venus Treasury](https://bscscan.com/address/${VTREASURY}). Transfers 480,000 USDT to the Liquidity Reserve multisig.
- **Withdraw USDC** — Calls withdrawTreasuryBEP20(${USDC}, ${USDC_AMOUNT}, ${FINANCE_MULTISIG}) on the [Venus Treasury](https://bscscan.com/address/${VTREASURY}). Transfers 720,000 USDC to the Liquidity Reserve multisig.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Withdraw 480,000 USDT from the Treasury to the finance multisig.
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, FINANCE_MULTISIG],
      },

      // Withdraw 720,000 USDC from the Treasury to the finance multisig.
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT, FINANCE_MULTISIG],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip631;
