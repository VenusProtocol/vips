import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PLANET = "0xca6d678e74f553f0e59cccc03ae644a3c2c5ee7d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER = "0xF322942f644A996A617BD29c16bd7d231d9F35E9"; //  To be revised
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VPLANET_DEFI = "0x9A525D02A06C054484c5e0eC7A5E0c70AC4D36B4";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const MAX_STALE_PERIOD = 60 * 25;

export const vip197 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "Add PLANET market to DeFi Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["PLANET", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PLANET,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4",
        signature: "upgradeTo(address)",
        params: ["0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B"],
      },

      {
        target: VPLANET_DEFI,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [28800],
      },
      {
        target: VPLANET_DEFI,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [PLANET, parseUnits("174983000", 18), NORMAL_TIMELOCK],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("174983000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPLANET_DEFI,
            parseUnits("0.2", 18),
            parseUnits("0.3", 18),
            parseUnits("174983000", 18),
            VTOKEN_RECEIVER,
            parseUnits("500000000", 18),
            parseUnits("500000000", 18),
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("3000", 18), REWARD_DISTRIBUTOR],
      },
      {
        target: COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[VPLANET_DEFI], ["1860119047619047"], ["1860119047619047"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
