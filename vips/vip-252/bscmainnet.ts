import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
const COMMUNITY_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip252 = () => {
  const meta = {
    version: "v2",
    title: "VIP-252 Payments Issuance for audits & Refunds to Community Wallet",
    description: `#### Description

If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 32,500 USDC to Quantstamp for the retainer program
- Transfer 8,000 USDT to the Community Wallet for the CakePie Bribes
- Transfer 15,000 USDT to the Community Wallet for Venus 3rd Anniversary Campaign refund

#### Details

Certik - retainer program

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of February 2024. Scheduled audits by Certik in February: NativeTokenGateway
- Cost: 19,000 USDT, to be sent to the BEP20 address: 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

Quantstamp - retainer program

- Provider: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
- Concept: Retainer program - 1/4 monthly payment. Scheduled audits by Quantstamp in February: wstETH oracle and NativeTokenGateway
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-proposal-for-ongoing-audits/4083)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xdc7b9c9893f6766a15cdda3dc4d819e840f59d651aca3c83b0b04d76aaa8b349)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

CakePie Bribes

- Provider: CakePie (https://www.pancake.magpiexyz.io/)
- Concept: (4) $2,000 Bribes for 4 epochs
- References:
    - [Proposal in the community forum](https://community.venus.io/t/join-cakepie-as-a-bribery-market-participant/4063)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x898af459638c29f03c6dc6ac779029d5a46bb61b747753a50d0627ea18573ecd)
- Cost: 8,000 USDT to be sent to the BEP20 address: 0xc444949e0054A23c44Fc45789738bdF64aed2391

Venus 3rd Anniversary campaign

- Provider: Arculus ([Arculus Secure Crypto Cold Storage Wallet (getarculus.com)](https://www.getarculus.com/))
- Concept: Setup cost of white label Venus-Polyhedra Custom Hardware Wallets
- References: Venus [3rd Anniversary campaign](https://galxe.com/Venus/campaign/GCgmDtUSmG) on Galxe.
- Cost: 15,000 USDT to be sent to the BEP20 Address: 0xc444949e0054A23c44Fc45789738bdF64aed2391`,
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
        params: [USDC, parseUnits("32500", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("8000", 18), COMMUNITY_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("15000", 18), COMMUNITY_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip252;
