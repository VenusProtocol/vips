import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";
const LIQUIDATE_AND_REDEEM_HELPER = "0xA08301b7C5f4BccD654De95E8C9BD4388CC54Ec1";
const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const VUSDC_AMOUNT = parseUnits("326081635.9401868", 8);
const REPAY_AMOUNT = parseUnits("7605011.44891787996502290", 18);

export const vip267 = () => {
  const meta = {
    version: "v1",
    title: "VIP-267",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
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
        target: COMPTROLLER,
        signature: "_setLiquidatorContract(address)",
        params: [LIQUIDATE_AND_REDEEM_HELPER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, REPAY_AMOUNT, LIQUIDATE_AND_REDEEM_HELPER],
      },
      {
        target: LIQUIDATE_AND_REDEEM_HELPER,
        signature: "liquidateAndRedeemNative(address,address,address)",
        params: [EXPLOITER_WALLET, VUSDC, BINANCE_WALLET],
      },
      {
        target: COMPTROLLER,
        signature: "_setLiquidatorContract(address)",
        params: [LIQUIDATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip267;
