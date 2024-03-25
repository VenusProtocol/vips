import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNBxOracle = "0xE0C0cd050C91ED2e88D616C638C752F4007846D2";
export const SlisBNBOracle = "0xc25d6f7B014d50a8505c508B621768234eA27d0b";
export const StkBNBOracle = "0x3Dcd95d7544b440E5A648A96eCd3873a86DBAaEA";
export const ResilientOracle = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const stkBNB = "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C";
export const BNBx = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
export const slisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";

export const vip255 = () => {
  const meta = {
    version: "v2",
    title: "VIP to configure LST oracles",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: ResilientOracle,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            stkBNB,
            [
              StkBNBOracle,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: ResilientOracle,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNBx,
            [
              BNBxOracle,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: ResilientOracle,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            slisBNB,
            [
              SlisBNBOracle,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip255;