import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const REWARD_DISTRIBUTOR_CORE_0 = "0x6c65135d102e2Dfa1b0852351cF9b2cbc1788972";
export const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
export const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const VUSDT_CORE = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ZERO_ADDRESS,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },
    // CORE POOL REWARDS
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, parseUnits("365000", 6), REWARD_DISTRIBUTOR_CORE_0],
    },
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VUSDT_CORE], ["2893"], ["2893"]],
    },
  ]);
};

export default vip008;
