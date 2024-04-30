import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const REWARD_DISTRIBUTOR_CORE_0 = "0x8E73FE3F7E29100Ad9d1C7F35fba2D2c823c8579";
export const COMPTROLLER_CORE = "0xA198909e8432f262f6978F2C81B04b32c55eb063";
export const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
export const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const VUSDT_CORE = "0xFf3a9fD8d4f208Ed98f56A5F771AD470258866D7";
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
