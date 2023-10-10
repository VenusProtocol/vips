import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
export const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP_RECEIVER = "0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2";
export const OZ_RECEIVER = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const CHAOSLABS_RECEIVER = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const STEAKHOUSE_RECEIVER = "0x0780c26389aca2B42ad9e4D5356804A9dEf80757";

export const vip180 = () => {
  const meta = {
    version: "v2",
    title: "VIP-180 Payments Issuance for performed Audits and Retainer Program",
    description: `**Description**

    #### Description
    If passed this VIP will perform the following actions:
    - Transfer 7,000 USDC to Peckshield for the BUSDLiquidator audit
    - Transfer 24,000 USDC to Peckshield for the Multichain deployment audit
    - Transfer 25,000 USDT to Quantstamp for the Multichain deployment audit
    - Transfer 19,000 USDT to Certik for the retainer program
    - Transfer 277,200 USDC to OpenZeppelin
    - Transfer 200,000 USDT to Chaos Labs
    - Transfer 50,000 VAI to Steakhouse Financial
    #### Details
    Peckshield - BUSDLiquidator
    - Auditor: Peckshield ([https://peckshield.com](https://peckshield.com/))
    - Payload: BUSDLiquidator - contract used to perform the forced liquidations on BUSD positions
    - Status: audit starts on October 3rd, 2023. ETA: October 6th, 2023
    - Cost: 7,000 USDC, to be sent to the BEP20 address 0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1
    Peckshield - Multichain deployment
    - Auditor: Peckshield ([https://peckshield.com](https://peckshield.com/))
    - Payload: Multichain deployment - update of the protocol contracts to be deployed to different chains
    - Status: audit starts on October 12th, 2023. ETA: October 18th, 2023
    - Cost: 24,000 USDC, to be sent to the BEP20 address 0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1
    Quantstamp - Multichain deployment
    - Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
    - Payload: Multichain deployment - update of the protocol contracts to be deployed to different chains.
    - Status: audit started on August 28th, 2023. ETA: September 18th, 2023
    - Cost: 25,000 USDT, to be sent to the BEP20 address 0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2
    - The total cost of the audit is 55,000 USDT. The audit of Prime by Quantstamp, paid in the [VIP-164](https://app.venus.io/#/governance/proposal/164), was not finally performed because it was replaced by the Code4rena contest, see [VIP-173](https://app.venus.io/#/governance/proposal/173). The cost of the Prime audit by Quantstamp was 30,000 USDC, that is discounted from the cost of this audit. For that reason, in this VIP, 25,000 USDT will be transferred to Quantstamp (55,000 USDT - 30,000 USDC).
    Certik - retainer program
    - Auditor: Certik ([https://certik.com](https://certik.com/))
    - Concept: Retainer program - monthly payment of October 2023. Scheduled audits by Certik in October: Token converter
    - Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12
    OpenZeppelin - retainer program
    - Auditor: OpenZeppelin ([OpenZeppelin](https://www.openzeppelin.com/))
    - Concept: Retainer program - Quarterly payment for Q3 2023. The first payment was done in [VIP-138](https://app.venus.io/#/governance/proposal/138)
    - Cost: 277,200 USDC, to be sent to BEP20 address to be forwarded as ERC20 0xc444949e0054a23c44fc45789738bdf64aed2391
    Chaos Labs - retainer program
    - Provider: [ChaosLabs.xyz](http://chaoslabs.xys/)
    - Concept: Retainer program - Quarterly payment of Q3 2023 and Q4 2024
    - Cost: 200,000 USDT to be sent to the BEP20 address 0xfb1912af5b9d3fb678f801bf764e98f1c217ef35
    Steakhouse Financial - retainer program
    - Provider: [Steakhouse Financial](https://www.steakhouse.financial/)
    - Concept: Retainer Program - Quarterly Payment for Q4 2023
    - Cost: 50,000 VAI to be sent to the BEP20 address 0x0780c26389aca2B42ad9e4D5356804A9dEf80757`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("7000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("24000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("25000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("277200", 18), OZ_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("200000", 18), CHAOSLABS_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, parseUnits("50000", 18), STEAKHOUSE_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
