import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const CHAOS_LABS = "0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038";

export const CERTIK_AMOUNT_USDT = parseUnits("52500", 18);
export const FAIRYPROOF_AMOUNT_USDT = parseUnits("17500", 18);
export const VANGUARD_VANTAGE_AMOUNT_USDC = parseUnits("23750", 18);
export const CHAOS_LABS_AMOUNT_USDC = parseUnits("320000", 18);

export const vip474 = () => {
  const meta = {
    version: "v2",
    title: "VIP-474 Payments issuance for audits and other expenses",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 52,500 USDT to Certik, for the retainer program (February, March and April 2025)
- Transfer 17,500 USDT to FairyProof, for the audits of the Risk Oracles integration and the Capped and Cached Oracles
- Transfer 23,750 USDC to Messari Protocol Services for Commissioned Research reports
- Transfer 320,000 USDC Chaos Labs for risk management services

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of February, March and April 2025.
- Cost: 52,500 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**Fairyproof**

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload 1:
    - Risk Oracles integration ([here](https://github.com/VenusProtocol/governance-contracts/pull/115))
    - Cost: 7,500 USDT
- Payload 2:
    - Capped and Cached oracles ([here](https://github.com/VenusProtocol/oracle/pull/239))
    - Cost: 10,000 USDT
- Total cost: 17,500 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

**Chaos Labs**

- Transfer 320,000 USDC to Chaos Labs for Quarterly Fees
- Risk Management services from January 1, 2025 - July 31, 2025
- To be sent to BEP20:0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038

**MESSARI Protocol Services**

- Transfer 23,750 USDC to Messari Protocol Services for Venus Commissioned Research reports. (Q4-2024 to Q3-2025)
- Funds will be transferred to Vanguard Treasury for payment to be issued to Messari on Coinbase Pay.
- BEP-20: 0xf645a387180F5F74b968305dF81d54EB328d21ca

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/530)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT_USDT, CERTIK],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT_USDT, FAIRYPROOF],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, VANGUARD_VANTAGE_AMOUNT_USDC, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT_USDC, CHAOS_LABS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip474;
