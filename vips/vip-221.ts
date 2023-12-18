import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

export const vip221 = () => {
  const meta = {
    version: "v2",
    title: "VIP-221 Enable forced liquidation for BNB bridge exploiter",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidationForUser(address,address,bool)",
        params: [EXPLOITER_WALLET, VUSDC, true],
      },
      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidationForUser(address,address,bool)",
        params: [EXPLOITER_WALLET, VUSDT, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
