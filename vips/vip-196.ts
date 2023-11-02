import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const UQUID_RECEIVER = "0x03e3ff995863828554282e80870b489cc31dc8bc";
export const VRTUHub_RECEIVER = "0x07bF87ac31cD2EA296F53CF35d9028aF7287C2ff";
export const MESSARI_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip196 = () => {
  const meta = {
    version: "v2",
    title: "VIP-196 Payments ",
    description: `#### Description

If passed this VIP will perform the following actions:

- Certik - retainer program: Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

- UQUID - VAI support: Cost: 10,000 VAI, to be sent to the BEP20 address 0x03e3ff995863828554282e80870b489cc31dc8bc

- VRTUHub.com: Cost: 15,000 VAI, to be sent to the BEP20 address 0x07bF87ac31cD2EA296F53CF35d9028aF7287C2ff

- Messari: Cost: 95,000 USDC, to be sent to the Community wallet (0xc444949e0054A23c44Fc45789738bdF64aed2391)

- Venus Prime GALXE Campaign - Refund: Cost: 25,000 USDT, to be sent to the Community wallet (0xc444949e0054A23c44Fc45789738bdF64aed2391)

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
        params: [USDC, parseUnits("95000", 18), MESSARI_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("25000", 18), MESSARI_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
