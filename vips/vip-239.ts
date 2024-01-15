import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const ADDRESSES_2 = [
  "0x4252bf89d4225c587c797820028f7fef080c33f4",
  "0x51e76fd862d563d58b7a807b01eabe0f3b07ac1a",
  "0x53beb1e70d3d051d1e8b061ab93a6212c728317d",
  "0x604e1c7b92409106ef857ae72993d1f389d4da08",
  "0x63ad17144252dc8e757f629bea4d060074ece4e6",
  "0x87b9d6e007fac40716877101d5dd5950e7321f14",
  "0x8dcb8c40f0337399efc9ac543d8c18f6c9e8bde1",
  "0x8dd7b41c2a54f4ae983b5240eff60977494e65ed",
  "0xa7df5a0dd755baf70f8229cfbc7f032dd6476391",
  "0xaad950242f130d590fdb96f95b53fa9c0fa74dea",
  "0xaee09af04285e02d19f05ff608c7548c3ca56730",
  "0xb48df2de5833abf4dd5bd1f7fcad1b1f023cb8db",
  "0xb9056d39efa7d60dbc7e0b2b872e154dd7869c5f",
];

export const vip239 = () => {
  const meta = {
    version: "v2",
    title: "VIP-239 Prime tokens for Venus 3rd Anniversary x Polyhedra Campaign winners (2/2)",
    description: `If passed this VIP will mint 13 Prime tokens to part of the winners of the [Venus 3rd Anniversary x Polyhedra Campaign](https://community.venus.io/t/venus-3rd-anniversary-x-polyhedra-campaign-results/4020).

This is the second VIP mentioned in the [VIP-238](https://app.venus.io/#/governance/proposal/238)

After 30 days, another VIP will be proposed to burn these Prime tokens.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PRIME,
        signature: "issue(bool,address[])",
        params: [true, ADDRESSES_2],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
