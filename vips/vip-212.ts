import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const BINANCE_ORACLE_RECEIVER = "0x9c492e6c087b50f9191e671b6781be81579942ab";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip212 = () => {
  const meta = {
    version: "v2",
    title: "VIP-212 Payments Issuance for audits and other expenses",
    description: `#### Description

If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 15,000 USDT to the Community wallet (refund for the ProBit Listing)
- Transfer 36,000 USDT to Binance Oracle

#### Details

Certik - retainer program

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of December 2023. Scheduled audits by Certik in December: XVS bridge and Prime upgrade
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

ProBit Listing

- Concept: XVS Listing and marketing fees in [Probit.com](https://www.probit.com/)
- Cost: 15,000 USDT, to be refunded to the Community wallet. BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391

Binance Oracle

- Concept: Integration, customization and Development Fees
- Cost: 36,000 USDT (pending official invoice), to be transferred to the BEP20 address 0x9c492e6c087b50f9191e671b6781be81579942ab`,

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
        params: [USDT, parseUnits("15000", 18), COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("36000", 18), BINANCE_ORACLE_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
