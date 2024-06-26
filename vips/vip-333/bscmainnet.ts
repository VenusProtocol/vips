import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

export const VANGUARD_VANTAGE_WALLET = "0xDeA0b46950dDc377E71800deba8F52456A7E42EE";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const VANGUARD_VANTAGE_AMOUNT = parseUnits("542000", 18);
export const VUSDC_AMOUNT = parseUnits("22583333", 8); // assuming 1 usdc = 0.024 vusdc redeem 542,000 usdc

export const vip333 = () => {
  const meta = {
    version: "v2",
    title: "VIP-333 Creation of the Vanguard Vantage program",
    description: `#### Summary

If passed, this VIP will transfer the budget requested by the Vanguard Vantage Program team required for its deployment.

The "Vanguard Vantage’’ initiative is a transformative step forward in governance for the Venus Protocol, through the introduction of an innovative “Recognized Delegates” framework. 

By championing the principles of innovation, collaboration, and inclusive governance, Vanguard Vantage aims to become the driving force behind significant initiatives including Marketing, Liquidity Provisioning, Venus Stars, Ecosystem expansions, DEX’s and CEX’s collaborations and various DAO endeavors. 

This initiative is crafted not merely to propel growth and diversification within the Venus ecosystem but to markedly amplify our footprint in the DeFi realm. Vanguard Vantage will empower the Venus community with greater decision-making capabilities, ensuring that Venus remains at the cutting edge of DeFi, committed to our core values of decentralization, transparency, and financial empowerment for all.

If passed this VIP will perform the following actions:
  - Withdraw and redeem 18750000 vUSDT from the treasury
  - Transfer 542,000 USDC to the Vanguard Vantage program


#### Details
  - Website [Vanguard Vantage - DAO Management Solutions | Vanguard Vantage](https://vanguardvantage.io/)
  - Concept: Vanguard Vantage Annual Budget 
  - Cost: 542,000 USDC, to be sent to the BEP20 address 0xDeA0b46950dDc377E71800deba8F52456A7E42EE

#### References
  - Snapshot [Launch the Vanguard Vantage Program](https://snapshot.org/#/venus-xvs.eth/proposal/0x9728614f6c10a544569c3410356562dca8d1fb99ba9a582e752fa3a88569d01b)
  - [Proposal: Launch the Vanguard Vantage Program - Venus Governance - Venus Community](https://community.venus.io/t/proposal-launch-the-vanguard-vantage-program/4359)
  - [VIP simulation](https://github.com/VenusProtocol/vips/pull/312)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VUSDC, TREASURY],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, VANGUARD_VANTAGE_AMOUNT, VANGUARD_VANTAGE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip333;
