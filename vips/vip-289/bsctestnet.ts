import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const BNBxOracle = "0x24f6E7f40E3d8782E0c50d749625b6412437Af18";
export const BNBx = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
export const SlisBNBOracle = "0x57e9230b8e57561e0Be71075A0BAC1B6e6a3369E";
export const SlisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
export const StkBNBOracle = "0x78c1248c07c3724fe7D6FbD0e8D9859eF206B6d0";
export const StkBNB = "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C";
export const WBETHOracle = "0x80f80ad1d963673819752c234339901fa19fA7cb";
export const WBETH = "0x9c37E59Ba22c4320547F00D4f1857AF1abd1Dd6f";

export const WBETH_EXCHANGE_RATE = parseUnits("1.036711601665", "18");

const vip289 = () => {
  const meta = {
    version: "v2",
    title: "VIP-283",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
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
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SlisBNB,
            [
              SlisBNBOracle,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            StkBNB,
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
        target: WBETH,
        signature: "setExchangeRate(uint256)",
        params: [WBETH_EXCHANGE_RATE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WBETH,
            [
              WBETHOracle,
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

export default vip289;
