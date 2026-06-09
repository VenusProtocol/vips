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

export const vip670 = () => {
  const meta = {
    version: "v2",
    title: "VIP-670 Treasury Withdrawal for bStock Liquidation and Fixed-Rate Vault Liquidity Seeding",
    description: `#### Summary

If passed, this VIP will withdraw stablecoin liquidity from the [Venus Treasury](https://bscscan.com/address/${VTREASURY}) on BNB Chain to a finance-controlled multisig, so the funds can be deployed for (1) a potential bStock liquidation and (2) seeding fixed-rate vault liquidity.

#### Proposed Changes

Withdraw the following amounts from the Treasury to the finance multisig [${FINANCE_MULTISIG}](https://bscscan.com/address/${FINANCE_MULTISIG}):

- **480,000 USDT**
- **720,000 USDC**

Both transfers are executed via \`VTreasury.withdrawTreasuryBEP20\`.`,
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

export default vip670;
