import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const RECEIVER = "0x6657911f7411765979da0794840d671be55ba273";
export const BNB_AMOUNT = parseUnits("26438.868831443265017372", 18);

export const vip199 = () => {
  const meta = {
    version: "v2",
    title: "VIP-199 BUSD shortfall repayment preparation",
    description: `#### Summary

If approved, this VIP will initiate the necessary steps to repay an estimated $6,486,776 of the $13,521,179 total shortfall in the BUSD market. This repayment will be financed by the treasury's BNB funds, 26,438.87 BNB, valued at approximately $6,486,776. This value closely matches the risk fund accrued for 2023 according to our tokenomics. The required steps are as follows:

1. Transfer 26,438.87 BNB from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to [Binance](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273) for the conversion to BUSD.
2. Transfer the funds from Binance to the protocol’s treasury.
3. Use the BUSD in the treasury to make the repayment.

This VIP will cover step 1. Once the funds are received from Binance, another VIP will be required to execute step 3.

#### Description

*Considerations: All USD values consider token prices for Nov 8, 2023*

The estimated protocol revenues for 2023 are $6,831,206, taking into account the closing prices of underlying tokens for each quarter. Out of this total, $3,187,349 will be allocated to the risk fund. Furthermore, the fees generated from the liquidation of the exploiter’s 14,092 BNB, equivalent to $3,459,600 USD, will also be entirely dedicated to the risk fund. As a result, the total risk fund allocation for 2023 amounts to $6,646,949. With this, the idea is to utilize the BNB balance held in the treasury, which is estimated at $6,486,776 (98% of the risk fund allocation), to simplify the repayment process as only 1 token conversion will be required.

Future proposals will look to complete this repayment process and underlying token conversions for proper treasury management.

**References**

- [Venus Tokenomics](https://docs-v4.venus.io/governance/tokenomics)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, RECEIVER],
        value: "0",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
