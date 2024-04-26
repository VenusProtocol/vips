import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const REDEEMER = "0x29171F17BF7F3691908eD55bAC2014A632B87dD3";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const PESSIMISTIC = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CHAOS_LABS = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const SKYNET = "0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c";

// USDC
export const CHAOS_LABS_AMOUNT = parseUnits("94000", 18);
export const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);

// USDT
export const CERTIK_AMOUNT = parseUnits("17500", 18);
export const PESSIMISTIC_AMOUNT = parseUnits("5000", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("2500", 18);
export const COMMUNITY_WALLET_AMOUNT = parseUnits("10000", 18);
export const SKYNET_USDT_AMOUNT_DIRECT = parseUnits("275600", 18);

export const SKYNET_XVS_AMOUNT = parseUnits("52884", 18);

/**
 * 1 USDT = 42.193692 vUSDT
 * so, 338,000 USDT = 14,232,000 vUSDT
 */
export const vUSDT_REDEEM_AMOUNT = parseUnits("14232000", 8);
export const REDEEM_USDT_AMOUNT = parseUnits("338000", 18);

/**
 * 1 USDC = 42.12482 vUSDC
 * so 56,000 USDC = 2,361,389.2 vUSDC
 */
export const vUSDC_REDEEM_AMOUNT = parseUnits("2361389.2", 8);
export const REDEEM_USDC_AMOUNT = parseUnits("56000", 18);

export const vip297 = () => {
  const meta = {
    version: "v2",
    title: "VIP-297 ",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PESSIMISTIC_AMOUNT, PESSIMISTIC],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT, CHAOS_LABS],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_WALLET_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [SKYNET, SKYNET_XVS_AMOUNT],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDT, vUSDT_REDEEM_AMOUNT, REDEEMER],
      },
      {
        target: REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [vUSDT, SKYNET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, SKYNET_USDT_AMOUNT_DIRECT, SKYNET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, vUSDC_REDEEM_AMOUNT, REDEEMER],
      },
      {
        target: REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [vUSDC, CHAOS_LABS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip297;
