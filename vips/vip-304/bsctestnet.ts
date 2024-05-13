import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A";
export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
export const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const BABYDOGE = "0x4FA37fFA9f36Ec0e0e685C06a7bF169bb50409ce";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const VBABYDOGE = "0x73d2F6e0708599a4eA70F6A0c55A4C59196a101c";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const VUSDT = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const REWARDS_DISTRIBUTOR = "0x34e14e4A5f5de28f8e58aeD296068ce5c3C25C4c";
export const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";

export const STALE_PERIOD = 60 * 60 * 24; // 24 hour
export const BABYDOGE_SUPPLY = parseUnits("27917365987868.178893572", 9);
export const USDT_SUPPLY = parseUnits("5000", 6);
export const REWARDS_AMOUNT = parseUnits("15726472026491.075844320", 9);

const vip304 = () => {
  const meta = {
    version: "v2",
    title: "Meme Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Set Oracle Config for BabyDoge
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["BABYDOGE", STALE_PERIOD],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["BabyDoge", "BABYDOGE"],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BABYDOGE,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },

      // Add Meme Pool
      {
        target: COMPTROLLER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER,
        signature: "setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
      {
        target: POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Meme", COMPTROLLER, "500000000000000000", "1100000000000000000", "100000000000000000000"],
      },

      // Add BabyDoge Market
      {
        target: BABYDOGE,
        signature: "faucet(uint256)",
        params: [BABYDOGE_SUPPLY],
      },
      {
        target: BABYDOGE,
        signature: "transfer(address,uint256)",
        params: [TREASURY, BABYDOGE_SUPPLY],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BABYDOGE, BABYDOGE_SUPPLY, NORMAL_TIMELOCK],
      },
      {
        target: BABYDOGE,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
      },
      {
        target: BABYDOGE,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, BABYDOGE_SUPPLY],
      },
      {
        target: VBABYDOGE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["100"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VBABYDOGE,
            "300000000000000000",
            "400000000000000000",
            BABYDOGE_SUPPLY,
            TREASURY,
            "1600000000000000000000000",
            "800000000000000000000000",
          ],
        ],
      },

      // Add USDT Market
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_SUPPLY, NORMAL_TIMELOCK],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, USDT_SUPPLY],
      },
      {
        target: VUSDT,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["100"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [VUSDT, "750000000000000000", "770000000000000000", USDT_SUPPLY, TREASURY, "1000000000000", "900000000000"],
        ],
      },

      // Add Rewards Distributor
      {
        target: BABYDOGE,
        signature: "faucet(uint256)",
        params: [REWARDS_AMOUNT],
      },
      {
        target: BABYDOGE,
        signature: "transfer(address,uint256)",
        params: [REWARDS_DISTRIBUTOR, REWARDS_AMOUNT],
      },
      {
        target: REWARDS_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARDS_DISTRIBUTOR],
      },
      {
        target: REWARDS_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[VBABYDOGE], ["12134623477230768"], ["12134623477230768"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip304;
