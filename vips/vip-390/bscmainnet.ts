import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const VANGUARD_VINTAGE = "0xDeA0b46950dDc377E71800deba8F52456A7E42EE";
export const COMMUNITY = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const CHAOS_LABS = "0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038";
export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";

export const VANGUARD_VINTAGE_AMOUNT_USDT = parseUnits("17895", 18);
export const COMMUNITY_BELNCRYPTO_AMOUNT_USDT = parseUnits("93800", 18);
export const CHAOS_LABS_AMOUNT_USDC = parseUnits("160000", 18);
export const COMMUNITY_SOURCECONTROL_AMOUNT_USDT = parseUnits("24000", 18);
export const CERTIK_AMOUNT_USDT = parseUnits("35000", 18);

export const vip390 = () => {
  const meta = {
    version: "v2",
    title: "VIP-390",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Refund 17,895 USDT to Vanguard Vantage of various Venus marketing
- Transfer 93,800 USDT to Community wallet for PR Agency BeInCrypto
- Transfer 160,000 USDC to Chaos labs for the Quarterly payment
- Transfer 24,000 USDT to Community wallet for SourceControl Web3
- Transfer 35,000 USDT to Certik

#### Details

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/359)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VINTAGE_AMOUNT_USDT, VANGUARD_VINTAGE],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_BELNCRYPTO_AMOUNT_USDT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT_USDC, CHAOS_LABS],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_SOURCECONTROL_AMOUNT_USDT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT_USDT, CERTIK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip390;
