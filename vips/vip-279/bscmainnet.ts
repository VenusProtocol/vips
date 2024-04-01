import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CANTINA_RECEIVER = "0x3Dcb7CFbB431A11CAbb6f7F2296E2354f488Efc2";
export const NODEREAL_RECEIVER = "0x3266be0289c57e09f18db689cfc34ed3efe995e8";

export const CERTIK_USDT_AMOUNT = parseUnits("19000", 18).toString();
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18).toString();
export const FAIRYPROOF_USDT_AMOUNT = parseUnits("6000", 18).toString();
export const CANTINA_USDC_AMOUNT = parseUnits("85000", 18).toString();
export const NODEREAL_USDT_AMOUNT = parseUnits("26730", 18).toString();

export const vip279 = () => {
  const meta = {
    version: "v2",
    title: "VIP-279 Payments issuance for audits and other expenses",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 32,500 USDC to Quantstamp for the retainer program
- Transfer 6,000 USDT to Fairyproof for the audit of Correlated token oracles
- Transfer 85,000 USDC to Cantina for the contest of Multichain Governance
- Transfer 26,730 USDT to NodeReal for the Meganode Enterprise service (Web3 RPC endpoint)

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of April 2024. Scheduled audits by Certik in April: mesh pattern for the XVS bridges
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**Quantstamp - retainer program**

- Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
- Concept: Retainer program - 3/4 monthly payment. Scheduled audits by Quantstamp in April: Correlated token oracles and Multichain Governance
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-proposal-for-ongoing-audits/4083)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xdc7b9c9893f6766a15cdda3dc4d819e840f59d651aca3c83b0b04d76aaa8b349)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

**Fairyproof - Correlated token oracles and unlist markets**

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload:
    - [Correlated token oracles](https://github.com/VenusProtocol/oracle/pull/165)
    - [Unlist markets on the Core pool](https://github.com/VenusProtocol/venus-protocol/pull/429)
    - [Unlist markets on the Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/349)
    - [Fix Borrow Cap 0 Logic on the Core pool](https://github.com/VenusProtocol/venus-protocol/pull/438)
- Status: audit started on March 20th, 2024. Completed on March 27th, 2024
- Cost: 6,000 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

**Cantina - Multichain Governance**

- Auditor: Cantina ([https://cantina.xyz](https://cantina.xyz/)). Contest: https://cantina.xyz/competitions/ddf86a5c-6f63-430f-aadc-d8742b4b1bcf
- Payload: [Multichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- Status: contest started on March 22nd, 2024. ETA: April 5th, 2024
- Cost: 85,000 USDC, to be sent to the BEP20 address 0x3Dcb7CFbB431A11CAbb6f7F2296E2354f488Efc2

**NodeReal - Meganode Enterprise**

- Provider: NodeReal ([https://nodereal.io](https://nodereal.io/))
- Service: Meganode Enterprise ([https://nodereal.io/meganode](https://nodereal.io/meganode)) for 11 months (April 2023 - February 2024). The Web3 RPC endpoints provided by NodeReal are used by the [official Venus UI](https://app.venus.io/) and several backend services to collect data from the different blockchains (BNB Chain, Ethereum, opBNB).
- Cost: 26,730 USDT (2,430 USDT per month)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/245)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_USDT_AMOUNT, CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_USDT_AMOUNT, FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CANTINA_USDC_AMOUNT, CANTINA_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, NODEREAL_USDT_AMOUNT, NODEREAL_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip279;
