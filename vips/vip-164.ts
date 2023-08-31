import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const QUANTSTAMP_RECEIVER = "0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2";

export const vip164 = () => {
  const meta = {
    version: "v2",
    title: "VIP-164 Payments Issuance for performed Audits",
    description: `**Description**

If passed this VIP will perform the following actions:

* Transfer 45,000 USDC to Quantstamp for the Automatic allocation of income audit
* Transfer 30,000 USDC to Quantstamp for the Venus Prime audit
* Transfer 10,000 USDT to Fairyproof for the Token converter audit
* Transfer 12,000 USDC to Peckshield for the Token converter audit
* Transfer 19,000 USDT to Certik for the retainer program

**Details**

Quantstamp - Automatic income allocation

* Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
* Payload: Automatic income allocation. Distribute the reserves generated in the protocol, in an automatic way, following the agreed [Tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9)
* Status: audit started on August 28th, 2023. ETA: September 18th, 2023
* Cost: 45,000 USDC, to be sent to the BEP20 address 0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2

Quantstamp - Venus Prime

* Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
* Payload: Venus Prime. [https://github.com/VenusProtocol/venus-protocol/pull/196](https://github.com/VenusProtocol/venus-protocol/pull/196)
* Status: audit starts on September 13th, 2023. ETA: September 22nd, 2023
* Cost: 30,000 USDC, to be sent to the BEP20 address 0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2

Fairyproof - Token converter

* Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
* Payload: Token converter. [https://github.com/VenusProtocol/protocol-reserve/pull/9](https://github.com/VenusProtocol/protocol-reserve/pull/9)
* Status: audit started on August 21st, 2023, and it ended on August 25th, 2023
* Cost: 10,000 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

Peckshield - Token converter

* Auditor: Peckshield ([https://peckshield.com](https://peckshield.com/))
* Payload: Token converter. [https://github.com/VenusProtocol/protocol-reserve/pull/9](https://github.com/VenusProtocol/protocol-reserve/pull/9)
* Status: audit starts on August 30th, 2023. ETA: September 5th, 2023
* Cost: 12,000 USDC, to be sent to the BEP20 address 0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1

Certik - retainer program

* Auditor: Certik ([https://certik.com](https://certik.com/))
* Concept: Retainer program - monthly payment of September 2023. Scheduled audits by Certik in September: Venus Prime
* Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("45000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("30000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("10000", 18), FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("12000", 18), PECKSHIELD_RECEIVER],
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
