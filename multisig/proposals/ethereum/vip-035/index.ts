import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const sfrxETH = "0xac3E018457B222d93114458476f3E3416Abbe38F";
export const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const vsfrxETH = "0x625d47820d26976DDeABee38784d2843ca95D8Ae";
export const INITIAL_SUPPLY = parseUnits("1.2", 18);
export const REWARDS_DISTRIBUTOR_XVS = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const XVS_REWARD_TRANSFER = parseUnits("2400", 18);
export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const SUPPLY_CAP = parseUnits("10000", 18);
export const BORROW_CAP = parseUnits("1000", 18);
export const RECEIVER = "0x6e74053a3798e0fC9a9775F7995316b27f21c4D2";

export const SFrxETHOracle = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

export const vip035 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [sfrxETH, [SFrxETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },
    {
      target: SFrxETHOracle,
      signature: "acceptOwnership()",
      params: [],
    },

    // Add Market
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [sfrxETH, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
      value: "0",
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
      value: "0",
    },
    {
      target: vsfrxETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: vsfrxETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [vsfrxETH, "900000000000000000", "930000000000000000", INITIAL_SUPPLY, RECEIVER, SUPPLY_CAP, BORROW_CAP],
      ],
    },

    // Add FRAX and sFrax Market Rewards
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[vsfrxETH], ["3703703703703703"], ["0"]],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_TRANSFER, REWARDS_DISTRIBUTOR_XVS],
    },
  ]);
};

export default vip035;
