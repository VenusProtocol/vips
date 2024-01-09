import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const ADDRESSES = [
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
  "0x4252bf89d4225c587c797820028f7fef080c33f4",
  "0x51e76fd862d563d58b7a807b01eabe0f3b07ac1a",
  "0x53beb1e70d3d051d1e8b061ab93a6212c728317d",
  "0x604e1c7b92409106ef857ae72993d1f389d4da08",
  "0x63ad17144252dc8e757f629bea4d060074ece4e6",
  // "0x87b9d6e007fac40716877101d5dd5950e7321f14",
  // "0x8dcb8c40f0337399efc9ac543d8c18f6c9e8bde1",
  // "0x8dd7b41c2a54f4ae983b5240eff60977494e65ed",
  // "0xa7df5a0dd755baf70f8229cfbc7f032dd6476391",
  // "0xaad950242f130d590fdb96f95b53fa9c0fa74dea",
];

export const vip234 = () => {
  const meta = {
    version: "v2",
    title: "VIP-234 Venus Prime: Mint Irrevocable Prime Tokens",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [20, 500],
      },
      {
        target: PRIME,
        signature: "issue(bool,address[])",
        params: [true, ADDRESSES],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
