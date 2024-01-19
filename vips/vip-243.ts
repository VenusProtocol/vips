import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const CHAOS_LABS_RECEIVER = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";

export const vip243 = () => {
  const meta = {
    version: "v2",
    title: "VIP-243 Payments Issuance for audits and ChaosLabs Risk Management services",
    description: `#### Summary
If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 130,000 USDT to ChaosLabs for the retainer program

#### Details

Certik - retainer program

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of January 2024. Scheduled audits by Certik in December: Time-based contracts, multichain governance and wstETH oracle
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

ChaosLabs - retainer program

- Provider: Chaos Labs ([ChaosLabs.xyz](http://chaoslabs.xyz/))
- Concept: Coverage includes up to [50] assets across the generalized borrow markets and [8] isolated pools exclusively on the BNB Chain. 24-Month Pricing Model - $400K annually.Additional Scope: $120K annually for future Venus deployments, prorated from the launch date.
- Cost: 400K + 120K Annually per extra network. 130,000 USDT paid quarterly to the BEP20 Address: 0xfb1912af5b9d3fb678f801bf764e98f1c217ef35`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("130000", 18), CHAOS_LABS_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
