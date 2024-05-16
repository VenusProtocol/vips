import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBUSD = "0x95c78222b3d6e262426483d42cfa53685a67ab9d";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BORROWER = "0x8d655AAAA0ec224b17972df385e25325b9103332";
const repayAmount = parseUnits("6400762.2181", 18);

export const vip204 = () => {
  const meta = {
    version: "v2",
    title: "VIP-204 Repay BUSD debt on behalf borrower",
    description: `#### Summary

This VIP will perform the following action:

- Repay the amount of 6,400,762.2181 BUSD debt on behalf of wallet address [0x8d655AAAA0ec224b17972df385e25325b9103332](https://bscscan.com/address/0x8d655AAAA0ec224b17972df385e25325b9103332).

#### Description

Since 2023, Venus has been accumulating reserves in its risk fund totaling an estimated $6,851,872 USD. This value is calculated based on token prices for Nov 15, 2023.

If approved, this proposal will use 6,400,762.2181 BUSD worth of that fund to continue repayment of insolvent accounts.

**References**

- [VIP-199 BUSD shortfall repayment preparation](https://app.venus.io/#/governance/proposal/199)
- Previous shortfall repayments:
    - [VIP-118 ETH Shortfall Repayment](https://app.venus.io/#/governance/proposal/118)
    - [VIP-121 BTC Shortfall Repayment](https://app.venus.io/#/governance/proposal/121)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BUSD, repayAmount, NORMAL_TIMELOCK],
      },

      {
        target: BUSD,
        signature: "approve(address,uint256)",
        params: [vBUSD, repayAmount],
      },

      {
        target: vBUSD,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER, repayAmount],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
