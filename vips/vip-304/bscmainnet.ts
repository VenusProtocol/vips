import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d";
export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
export const TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const BABYDOGE = "0xc748673057861a797275CD8A068AbB95A902e8de";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const VBABYDOGE = "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const VUSDT = "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0";
export const REWARDS_DISTRIBUTOR = "0xC1044437AbfD8592150d612185581c5600851d44";
export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
export const SWAP_ROUTER = "0x9Db0CBD9A73339949f98C5E6a51e036d0dEaFf21";

export const STALE_PERIOD = 60 * 60 * 26; // 26 hour
export const BABYDOGE_SUPPLY = parseUnits("27917365987868.178893572", 9);
export const USDT_SUPPLY = parseUnits("5000", 18);
export const REWARDS_AMOUNT = parseUnits("15726472026491.075844320", 9);

export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const BaseAssets = [
  "0x55d398326f99059fF775485246999027B3197955", // USDT RiskFundConverter BaseAsset
  "0x55d398326f99059fF775485246999027B3197955", // USDT USDTTokenConverter BaseAsset
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC USDCTokenConverter BaseAsset
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB BTCBTokenConverter BaseAsset
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH ETHTokenConverter BaseAsset
  "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", // XVS XVSTokenConverter BaseAsset
];

const vip304 = (babyDogeMaxStalePeriodInSeconds: number = STALE_PERIOD) => {
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
        params: ["BABYDOGE", babyDogeMaxStalePeriodInSeconds],
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

      // Swap router
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
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
        "target": TREASURY,
        "signature": "withdrawTreasuryBEP20(address,uint256,address)",
        "params": [
          USDT,
          USDT_SUPPLY,
          NORMAL_TIMELOCK
        ],
      },
      {
        "target": USDT,
        "signature": "approve(address,uint256)",
        "params": [
          POOL_REGISTRY,
          0
        ],
      },
      {
        "target": USDT,
        "signature": "approve(address,uint256)",
        "params": [
          POOL_REGISTRY,
          USDT_SUPPLY
        ],
      },
      {
        target: VUSDT,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["100"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        "params": [
          [
            VUSDT,
            "750000000000000000",
            "770000000000000000",
            USDT_SUPPLY,
            TREASURY,
            "1000000000000000000000000",
            "900000000000000000000000"
          ]
        ],
      },

      // Add Rewards Distributor
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BABYDOGE, REWARDS_AMOUNT, NORMAL_TIMELOCK],
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

      // Conversions Config
      {
        target: RISK_FUND_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [BABYDOGE], [[0, 1]]],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [BABYDOGE], [[0, 1]]],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [BABYDOGE], [[0, 1]]],
      },
      {
        target: BTCB_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [BABYDOGE], [[0, 1]]],
      },
      {
        target: ETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [BABYDOGE], [[0, 1]]],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[5], [BABYDOGE], [[0, 1]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip304;
