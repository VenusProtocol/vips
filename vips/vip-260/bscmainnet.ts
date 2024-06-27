import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

export const vip260 = () => {
  const meta = {
    version: "v2",
    title: "VIP-260: Risk Fund, TUSD insolvency repayment",
    description: `Following [VIP-253](https://app.venus.io/#/governance/proposal/253), if passed, this VIP will transfer 105,000 [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) from the vTreasury to [Binance OTC](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273) to be converted into 105,000 [TUSD(OLD)](https://bscscan.com/address/0x14016E85a25aeb13065688cAFB43044C2ef86784). This amount, in addition to the current TUSD(OLD) holdings in the [vTreasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9), will be used to fully repay the TUSD(OLD) insolvency in another VIP as per the Risk Fund in Venus Tokenomics.

Additionally, other repayments will be made using the vTreasury underlying token balance to cover the residual shortfall balances in accounts different from 0x489…bec. At the end of this process, the total token repayments are as follows:

- 131,748.17 TUSD(OLD) for account: [0x0f2577cCB1e895eD1e8BFd4e709706595831e78A](https://debank.com/profile/0x0f2577ccb1e895ed1e8bfd4e709706595831e78a)
- 12,482.28 TUSD(OLD) for account: [0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2](https://debank.com/profile/0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2)
- 228.9054 BNB for account: [0xbd043882d36b6def4c30f20c613cfa70d3af8bb7](https://debank.com/profile/0xbd043882d36b6def4c30f20c613cfa70d3af8bb7)
- 22,483.82 USDT for account: [0x0f2577cCB1e895eD1e8BFd4e709706595831e78A](https://debank.com/profile/0x0f2577ccb1e895ed1e8bfd4e709706595831e78a)

The total estimated repayment amount is: $249,074.44 considering token prices for February 16th, 2024.

The steps for this process are as follows:

1. Transfer 105,000 USDC from the vTreasury to Binance OTC to be converted to TUSD(OLD)
    1. The conversion will only consider 105,000 TUSD(OLD) so any amount left in USDC will not be converted and directly transferred back to the vTreasury.
2. Once the TUSD(OLD) is received, in another VIP, make the repayment using the vTreasury balance for the amounts and accounts mentioned above.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("105000", 18), BINANCE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip260;
