import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const WeETH_ORACLE_EQUIVALENCE = "0xEa687c54321Db5b20CA544f38f08E429a4bfCBc8";
export const weETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
export const CHAINLINK_WEETH_FEED = "0x5c9C449BbC9a6075A2c061dF312a35fd1E05fF22";
export const VTREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";
export const vweETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const REWARDS_DISTRIBUTOR = "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06";
export const COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const MULTISIG = "0xF6C612c745Ba4546075DB62902c1Eb3255CdAe28";

// 24 hours stale period as per https://data.chain.link/feeds/ethereum/mainnet/weeth-eth
export const CHAINLINK_STALE_PERIOD = "86400";
export const REWARD_SPEED = "23148";
export const USDC_REWARD_TRANSFER = parseUnits("5000", 6);
export const WEETH_AMOUNT = parseUnits("2.761910220333160209", 18);

export const vip019 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[weETH, CHAINLINK_WEETH_FEED, CHAINLINK_STALE_PERIOD]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          weETH,
          [WeETH_ORACLE_EQUIVALENCE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },

    // Add Market
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [weETH, WEETH_AMOUNT, ethereum.NORMAL_TIMELOCK],
      value: "0",
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, WEETH_AMOUNT],
      value: "0",
    },
    {
      target: vweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
      value: "0",
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vweETH,
          "900000000000000000",
          "930000000000000000",
          WEETH_AMOUNT,
          MULTISIG,
          "7500000000000000000000",
          "750000000000000000000",
        ],
      ],
      value: "0",
    },

    // Add Rewards
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
      params: [[vweETH], [REWARD_SPEED], ["0"]],
      value: "0",
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, USDC_REWARD_TRANSFER, REWARDS_DISTRIBUTOR],
      value: "0",
    },
  ]);
};

export default vip019;
