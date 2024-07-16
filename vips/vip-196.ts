import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const UQUID_RECEIVER = "0x03e3ff995863828554282e80870b489cc31dc8bc";
export const VRTUHub_RECEIVER = "0x07bF87ac31cD2EA296F53CF35d9028aF7287C2ff";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip196 = () => {
  const meta = {
    version: "v2",
    title: "VIP-196 Payments Issuance for audits and other providers",
    description: `#### Description

If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 10,000 VAI to UQUID for the VAI integration on their online platform as per [their proposal](https://community.venus.io/t/proposal-integrate-vai-stablecoin-as-payment-method-in-uquid/3843) and [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x0666a261266a4fe6ece5e531a743637182b4fd25db32d839abbd3f049b00bb94)
- Transfer 15,000 VAI to VRTUHUB.com as a grant for their [proposed](https://community.venus.io/t/grant-proposal-for-vrtuhub/3688/2) virtual e-sports VAI Gaming Hub ([snapshot](https://community.venus.io/t/grant-proposal-for-vrtuhub/3688/2))
- Transfer 95,000 USDC to the Community Wallet, to perform the payment to Messari ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x5592915201e1f0362c645f4e47743e65436a198827d1a184a38c47207be12e19))
- Transfer 25,000 USDT to the Community Wallet, for the Venus Prime campaign refund

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of November 2023. Scheduled audits by Certik in October: Private conversions and Multichain deployment
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**UQUID**

- Uquid.com
- [Snapshot votes](https://snapshot.org/#/venus-xvs.eth/proposal/0x0666a261266a4fe6ece5e531a743637182b4fd25db32d839abbd3f049b00bb94)
- VAI integration on Uquid online shopping platform. [Proposal to the Venus community](https://community.venus.io/t/proposal-integrate-vai-stablecoin-as-payment-method-in-uquid/3843)
- Cost: 10,000 VAI, to be sent to the BEP20 address 0x03e3ff995863828554282e80870b489cc31dc8bc

**VRTUHub.com**

- [Proposal to the Venus community](https://community.venus.io/t/grant-proposal-for-vrtuhub/3688/2)
- [Snapshot votes](https://snapshot.org/#/venus-xvs.eth/proposal/0xc08f821f426ad15a1c52fd28f581a35e483fbba10722f03c73b868f3b5b7b8df)
- 10,000 VAI will be used to develop the brand and acquire the necessary equipment and setup needed to professionally broadcast virtual esports events.
- 5,000 VAI will be used to fund the initial debut championship. This amount also covers the entry fee for Venus Protocol and includes a (600 VAI entry fee + 1400 VAI prize fee contribution). The remaining 3,000 VAI will be used to pay for commentators, stream directors, studio/venue hire, and other associated costs.
- Cost: 15,000 VAI, to be sent to the BEP20 address 0x07bF87ac31cD2EA296F53CF35d9028aF7287C2ff

**Messari - Protocol Services, Quarterly Research Renewal**

- [Messari.io](https://messari.io/)
- [Snapshot votes](https://snapshot.org/#/venus-xvs.eth/proposal/0x5592915201e1f0362c645f4e47743e65436a198827d1a184a38c47207be12e19)
- (4) Quarterly Reports ($23,750/quarter)
- (1) Enterprise License ($8,000/annual) *comped
- Total: 95,000 USDC to be sent to the community wallet (0xc444949e0054A23c44Fc45789738bdF64aed2391) for forwarding to: USDC (ERC-20): 0x726f339F16A479d0F87b96eEF9576Ed9A11aEcd0

**Community - Venus Prime GALXE Campaign (refund)**

- Concept: Return [disbursed](https://bscscan.com/tx/0xe76442336a4b36a7877db5585a70e22c6eb3359608018f3a270152f8e7206184) funds from the Community wallet to the winners of the Venus Prime Campaign
- Cost: 25,000 USDT, to be sent to the BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391`,
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
        params: [VAI, parseUnits("10000", 18), UQUID_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, parseUnits("15000", 18), VRTUHub_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("95000", 18), COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("25000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
