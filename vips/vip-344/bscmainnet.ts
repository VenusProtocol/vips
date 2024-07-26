import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119"
export const CHAINALYSIS = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const CHAOSLABS = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const COMMUNITY = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const SKYNET = "0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c";

export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

export const CERTIK_AMOUNT = parseUnits("17500", 18).mul(2); 
export const FAIRYPROOF_AMOUNT = parseUnits("7500", 18);
export const CHAINALYSIS_AMOUNT = parseUnits("21600", 18);
export const CHAOS_LABS_AMOUNT = parseUnits("170000", 18);
export const COMMUNITY_BNB_AMOUNT = parseUnits("2", 18);
export const COMMUNITY_USDT_AMOUNT = parseUnits("936.61", 18);
export const COMMUNITY_USDC_AMOUNT = parseUnits("313", 18);
export const SKYNET_XVS_AMOUNT = parseUnits("68000", 18);
export const SKYNET_BNB_AMOUNT = parseUnits("833.33", 18);

// Total USDC Balance of Treasury = 130,475
// USDC Needed = 21,600 + 170,000 + 313 = 191,913
// Extra USDC Needed = 191,913 - 130,475 = 61,438
// 1 vUSDC = 0.02420 USDC
// vUSDC Needed = 61,438 / 0.02420 = 2,538,843.47
export const VUSDC_AMOUNT = parseUnits("2538844", 8); 
export const USDC_AMOUNT = parseUnits("61438", 18);

export const vip344 = () => {
  const meta = {
    version: "v2",
    title: "VIP-344",
    description: ``,
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
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAINALYSIS_AMOUNT, CHAINALYSIS],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, VTREASURY, USDC_AMOUNT, VTREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT, CHAOSLABS],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, COMMUNITY_BNB_AMOUNT.add(SKYNET_BNB_AMOUNT), NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [COMMUNITY_BNB_AMOUNT.add(SKYNET_BNB_AMOUNT)],
      },
      {
        target: COMMUNITY,
        signature: "",
        params: [],
        value: COMMUNITY_BNB_AMOUNT.toString(),
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_USDT_AMOUNT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, COMMUNITY_USDC_AMOUNT, COMMUNITY],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [SKYNET, SKYNET_XVS_AMOUNT],
      },
      {
        target: SKYNET,
        signature: "",
        params: [],
        value: SKYNET_BNB_AMOUNT.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip344;
