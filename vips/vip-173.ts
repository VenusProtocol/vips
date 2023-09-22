import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip173 = () => {
  const meta = {
    version: "v2",
    title: "VIP-173 Payments Issuance for performed Audits",
    description: `If passed this VIP will perform the following actions:

* Transfer 5,000 USDC to Peckshield for the Forced liquidations audit
* Reimburse the community wallet for transfering 42,000 USDC to Code4rena for the Venus Prime audit

**Details**

Peckshield — Forced liquidations

* Auditor: Peckshield ([https://peckshield.com](https://peckshield.com))
* Payload: Forced liquidations. [https://github.com/VenusProtocol/venus-protocol/pull/332](https://github.com/VenusProtocol/venus-protocol/pull/332) 
* Status: audit starts on September 8th, 2023. Ended: September 12th, 2023
* Cost: 5,000 USDC, to be sent to the BEP20 address 0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1

Code4rena — Venus Prime

* Auditor: Code4rena ([https://code4rena.com](https://code4rena.com))
* Payload: Venus Prime. [https://github.com/VenusProtocol/venus-protocol/pull/196](https://github.com/VenusProtocol/venus-protocol/pull/196) 
* Status: contest starts by the end of September, 2023. Duration: 6 days
* Cost: 42,000 USDC, sent to the Ethereum mainnet address 0xC2bc2F890067C511215f9463a064221577a53E10 in this transaction: [https://etherscan.io/tx/0xd3838f59a4ca52ed91fdf2373ff7b4e2148a7d3a78268532e675aadbc49ba6ba](https://etherscan.io/tx/0xd3838f59a4ca52ed91fdf2373ff7b4e2148a7d3a78268532e675aadbc49ba6ba)
    * 10,000 USDC will be refunded at the end of the contest, if the github repository is not modified during the contest
`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("5000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("42000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
