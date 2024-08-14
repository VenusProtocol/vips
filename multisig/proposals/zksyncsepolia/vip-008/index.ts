import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const REWARD_TOKEN_SPEED = "11574074074074"; // 1 XVS/day
export const XVS = zksyncsepolia.XVS;
export const XVS_REWARD_AMOUNT = parseUnits("3600", 18);
export const XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";
export const XVS_VAULT_PROXY = "0x825f9EE3b2b1C159a5444A111A70607f3918564e";
export const REWARD_DISTRIBUTOR_CORE_0 = "0x8EDd58DC2C8e38bfc17f07D6f5E8831d87a6962e";
export const COMPTROLLER_CORE = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
export const VUSDC_E_CORE = "0x58b0b248BB11DCAA9336bBf8a81914201fD49461";
export const VUSDT_CORE = "0x7Bfd185eF8380a72027bF65bFEEAb0242b147778";
export const VWBTC_CORE = "0x9c2379ed8ab06B44328487f61873C7c44BD6E87D";
export const VWETH_CORE = "0x31eb7305f9fE281027028D0ba0d7f57ddA836d49";
export const VZK_CORE = "0x92f4BD794303c0BD0791B350Be5531DB38414f47";
const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

export const vip008 = () => {
  return makeProposal([
    // ACM Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlocks(address[],uint32[],uint32[])",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        zksyncsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        zksyncsepolia.GUARDIAN,
      ],
    },

    // Configure pool rewards
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [zksyncsepolia.XVS, XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [zksyncsepolia.XVS, REWARD_TOKEN_SPEED],
    },
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [zksyncsepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
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
        [VWETH_CORE, VWBTC_CORE, VUSDT_CORE, VUSDC_E_CORE, VZK_CORE],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407", "1157407407407"],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407", "1157407407407"],
      ],
    },
  ]);
};

export default vip008;
