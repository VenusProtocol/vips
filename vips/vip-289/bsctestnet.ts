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
export const ankrBNB = "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9";
export const ankrBNBOracle = "0x00ea3D7Abe2f04004Ce71f9ef5C04F5f8Dce2f55";

export const WBETH_EXCHANGE_RATE = parseUnits("1.036711601665", "18");
export const ankrBNB_EXCHANGE_RATE = parseUnits("1.080640588742602582", "18");

export const TEMP_POOL_REGISTRY_IMP = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
export const ORIGINAL_POOL_REGISTRY_IMP = "0xc4953e157D057941A9a71273B0aF4d4477ED2770";
export const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
export const OLD_ankrBNB = "0x167F1F9EF531b3576201aa3146b13c57dbEda514";
export const COMPTROLLER_ADDRESS = "0x596B11acAACF03217287939f88d63b51d3771704";
export const vankrBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";

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
            [BNBxOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
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
            [SlisBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
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
            [StkBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
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
            [WBETHOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: ankrBNB,
        signature: "setSharesToBonds(uint256)",
        params: [ankrBNB_EXCHANGE_RATE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ankrBNB,
            [ankrBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, TEMP_POOL_REGISTRY_IMP],
      },
      {
        target: POOL_REGISTRY,
        signature: "updateUnderlying(address,address,address,address)",
        params: [OLD_ankrBNB, ankrBNB, COMPTROLLER_ADDRESS, vankrBNB],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, ORIGINAL_POOL_REGISTRY_IMP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip289;
