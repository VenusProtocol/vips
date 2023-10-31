import { makeProposal } from "../../../src/utils";
import { ADDRESSES, ZERO_ADDRESS } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;

export const rewardConfiguration = () => {
  return makeProposal([
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_0,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: sepoliaContracts.COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_0],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepoliaContracts.VWBTC], ["15220700152207001"], ["15220700152207001"]],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_1,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: sepoliaContracts.COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_1],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepoliaContracts.VWETH], ["15220700152207001"], ["15220700152207001"]],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_2,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: sepoliaContracts.COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_2],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepoliaContracts.VUSDT], ["15220700152207001"], ["15220700152207001"]],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_3,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: sepoliaContracts.COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_3],
    },
    {
      target: sepoliaContracts.REWARDS_DISTRIBUTOR_CORE_3,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepoliaContracts.VUSDC], ["15220700152207001"], ["15220700152207001"]],
    },
  ]);
};
