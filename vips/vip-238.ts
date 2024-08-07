import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const ADDRESSES_1 = [
  "0x075f04828f6c976cba66fdd6fd277e4a9eded7c1",
  "0x07bf87ac31cd2ea296f53cf35d9028af7287c2ff",
  "0x085eba03890abd7db7aa27f46fb90638692db464",
  "0x09c7c14e61a2b3ce924ac27e6b110c46f255f536",
  "0x1feb56fe9b05dc9fb785f9eb5b24345497dc398e",
  "0x22adb734a54b634c558b3c1efe6098720c9f98d8",
  "0x2a564c1582898ee6d48f9339611c0092c03e989d",
  "0x34343908ee6eea5cc636271b99a9dac6c74bf2dd",
  "0x39c31a899662da8bba43862c82c8ba531dc61390",
  "0x3b1897657d4a37ba2aabdf31e5cc7d0d70521152",
];

export const vip238 = () => {
  const meta = {
    version: "v2",
    title: "VIP-238 Prime tokens for Venus 3rd Anniversary x Polyhedra Campaign winners (1/2)",
    description: `If passed this VIP will mint 10 Prime tokens to part of the winners of the [Venus 3rd Anniversary x Polyhedra Campaign](https://community.venus.io/t/venus-3rd-anniversary-x-polyhedra-campaign-results/4020).

There will be a second VIP minting the Prime tokens for the rest of the winners.

After 30 days, another VIP will be proposed to burn these Prime tokens.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [23, 500],
      },
      {
        target: PRIME,
        signature: "issue(bool,address[])",
        params: [true, ADDRESSES_1],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
