import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY_ETHEREUM = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const APXETH = "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const DINERO = "0x7f6494D4fBEA1c06daC2250A3FCa81003bF8D20C";

export const CERTIK_AMOUNT = parseUnits("35000", 18);
export const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("5000", 18);
export const DINERO_AMOUNT = parseUnits("3.508825127505014374", 18);

export const vip505 = () => {
  const meta = {
    version: "v2",
    title: "VIP-505 Payments to providers & refunds",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer 32,500 USDC to Quantstamp, for the retainer program
- Transfer 35,000 USDT to Certik, for the retainer program (May and June 2025)
- Transfer 5,000 USDT to FairyProof, for the audit of the WUSDMLiquidator contract
- Transfer 3.5 apxETH to Dinero, refunding the liquidity they provided [here](https://etherscan.io/tx/0xef3937f00cbafa1a086790d83e412e34b5180d30d9a0c68e007b023ecc86af52)

#### Quantstamp - retainer program

- Auditor: Quantstamp (https://quantstamp.com/)
- Concept: Retainer program renewal - 1/4 monthly payment. Quantstamp will charge $130,000 in total for the security services provided in [their proposal](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101). This will be paid in four monthly installments of $32,500 in USDC from the Venus Treasury, with the first to be paid on or around June 1st, 2025, and the fourth and final payment to be made on or around September 1st, 2025.
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101)
    - [Snapshot vote](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcc3b67bf1dd6c1bacdba42d42862713468872af39f73efe9c9c5243eb2285b46)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

#### Certik - retainer program

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of May and June 2025.
- Cost: 35,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

#### FairyProof - Source Code Audit

- Auditor: FairyProof (https://fairyproof.com/)
- Concept: Audit of the WUSDMLiquidator contract ([here](https://github.com/VenusProtocol/isolated-pools/pull/517))
- Cost: 5,000 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

#### Dinero - refund

- Destination: Dinero ([https://dinero.xyz](https://dinero.xyz/))
- Concept: Refund of the liquidity they provided [here](https://etherscan.io/tx/0xef3937f00cbafa1a086790d83e412e34b5180d30d9a0c68e007b023ecc86af52), following the [Chaos Labs recommendation](https://community.venus.io/t/venus-dinero/4690/5)
- Amount: 3.5 apxETH, to be sent to the ERC20 address 0x7f6494D4fBEA1c06daC2250A3FCa81003bF8D20C`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_AMOUNT, QUANTSTAMP],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: VTREASURY_ETHEREUM,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [APXETH, DINERO_AMOUNT, DINERO],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip505;
