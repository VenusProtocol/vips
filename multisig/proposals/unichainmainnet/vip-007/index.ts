import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const REWARD_TOKEN_SPEED = "77160493827160"; // 200 XVS / 30 days (77160493827160 XVS/second)
export const XVS = unichainmainnet.XVS;
export const XVS_REWARD_AMOUNT = parseUnits("1500", 18);
export const REWARD_DISTRIBUTOR_AMOUNT = parseUnits("18000", 18);
export const XVS_STORE = "0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb";
export const XVS_VAULT_PROXY = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";
export const REWARD_DISTRIBUTOR_CORE_0 = "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb";
export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const VUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const VWETH_CORE = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";
const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";

export const vip007 = () => {
  return makeProposal([
    // ACM Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        unichainmainnet.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        unichainmainnet.GUARDIAN,
      ],
    },

    // Configure pool rewards
    {
      target: unichainmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [unichainmainnet.XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [unichainmainnet.XVS, REWARD_TOKEN_SPEED],
    },
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: unichainmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [unichainmainnet.XVS, REWARD_DISTRIBUTOR_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VWETH_CORE, VUSDC_CORE],
        ["578703703703704", "578703703703704"],
        ["192901234567901", "192901234567901"],
      ],
    },
  ]);
};

export default vip007;
