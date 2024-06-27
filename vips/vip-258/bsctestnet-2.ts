import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const LIQUIDATOR_PROXY = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
const LIQUIDATOR_IMPL = "0x83372155Dd4A4306af82795d5A27d40188ED1F3B";
const PROXY_ADMIN = "0x1469AeB2768931f979a1c957692e32Aa802dd55a";

export const vip258Testnet2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-Liquidator Upgrades",
    description: `
    Update the implementation of liquidator after forced liquidation feature.
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Liquidator Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Liquidator Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Liquidator Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR_PROXY, LIQUIDATOR_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
