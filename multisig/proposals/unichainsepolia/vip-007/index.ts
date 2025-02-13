import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const REWARD_TOKEN_SPEED = "11574074074074"; // 1 XVS/day
export const XVS = unichainsepolia.XVS;
export const XVS_REWARD_AMOUNT = parseUnits("3600", 18);
export const XVS_STORE = "0xeE012BeFEa825a21b6346EF0f78249740ca2569b";
export const XVS_VAULT_PROXY = "0x3a33d235E23B6B54004E25FF8E622228df16717a";
export const REWARD_DISTRIBUTOR_CORE_0 = "0xeE51109E032595D2943397C73d8d5D0982C0E00D";
export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
export const VUSDC_CORE = "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A";
export const VUSDT_CORE = "0x2d8814e1358D71B6B271295893F7409E3127CBBf";
export const VcbBTC_CORE = "0x7d39496Ac9FdA5a336CB2A96FD5Eaa022Fd6Fb05";
export const VWETH_CORE = "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132";
const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";

export const vip007 = () => {
  return makeProposal([
    // ACM Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlocks(address[],uint32[],uint32[])",
        unichainsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        unichainsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        unichainsepolia.GUARDIAN,
      ],
    },

    // Configure pool rewards
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [unichainsepolia.XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [unichainsepolia.XVS, REWARD_TOKEN_SPEED],
    },
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [unichainsepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
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
        [VWETH_CORE, VcbBTC_CORE, VUSDT_CORE, VUSDC_CORE],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407"],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407"],
      ],
    },
  ]);
};

export default vip007;
