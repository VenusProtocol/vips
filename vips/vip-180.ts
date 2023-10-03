import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";

export const vip180 = () => {
  const meta = {
    version: "v2",
    title: "VIP-180 Payments Issuance for performed Audits and Retainer Program",
    description: `**Description**

If passed this VIP will perform the following actions:

* Transfer 7,000 USDC to Peckshield for the BUSDLiquidator audit
* Transfer 19,000 USDT to Certik for the retainer program subscription


#### Details

Peckshield - BUSDLiquidator

- Auditor: Peckshield ([https://peckshield.com](https://peckshield.com/))
- Payload: BUSDLiquidator - contract used to perform the forced liquidations on BUSD positions
- Status: audit starts on October 3rd, 2023. ETA: October 6th, 2023
- Cost: 7,000 USDC, to be sent to the BEP20 address 0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1

Certik - retainer program

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of October 2023. Scheduled audits by Certik in October: Token converter
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("7900", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
