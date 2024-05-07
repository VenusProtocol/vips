import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const sFRAXOracle = "0x27F811933cA276387554eAffD9860e513bA95AC3";
export const sFRAX = "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32";
export const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
export const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const vFRAX = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const vsFRAX = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const REWARDS_DISTRIBUTOR_XVS = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

export const XVS_REWARD_TRANSFER = parseUnits("4800", 18);
export const FRAX_INITIAL_SUPPLY = parseUnits("5000", 18);
export const sFRAX_INITIAL_SUPPLY = parseUnits("4800", 18);
export const CHAINLINK_FRAX_FEED = "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD";
export const VTOKEN_RECIEVER = "0x6e74053a3798e0fC9a9775F7995316b27f21c4D2";
export const STALE_PERIOD_100M = 60 * 100; // 100 minutes (for pricefeeds with heartbeat of 1 hr)

export const vip026 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[FRAX, CHAINLINK_FRAX_FEED, STALE_PERIOD_100M]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          FRAX,
          [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [sFRAX, [sFRAXOracle, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },

    // Add FRAX Market
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [FRAX, FRAX_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: FRAX,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: FRAX,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, FRAX_INITIAL_SUPPLY],
    },
    {
      target: vFRAX,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vFRAX,
          "750000000000000000",
          "800000000000000000",
          "5000000000000000000000",
          VTOKEN_RECIEVER,
          "10000000000000000000000000",
          "8000000000000000000000000",
        ],
      ],
    },

    // Add sFRAX Market
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [sFRAX, sFRAX_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: sFRAX,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: sFRAX,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, sFRAX_INITIAL_SUPPLY],
    },
    {
      target: vsFRAX,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vsFRAX,
          "750000000000000000",
          "800000000000000000",
          "4800000000000000000000",
          VTOKEN_RECIEVER,
          "10000000000000000000000000",
          "1000000000000000000000000",
        ],
      ],
    },

    // Add FRAX and sFrax Market Rewards
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [vFRAX, vsFRAX],
        ["1481481481481481", "2222222222222222"],
        ["2222222222222222", "1481481481481481"],
      ],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_TRANSFER, REWARDS_DISTRIBUTOR_XVS],
    },
  ]);
};

export default vip026;
