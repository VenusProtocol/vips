import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const VAI_VAULT_PROXY = "0x0667Eed0a0aAb930af74a3dfeDD263A73994f216";
const VRT_VAULT_PROXY = "0x98bF4786D72AAEF6c714425126Dd92f149e3F334";
const XVS_NEW = "0x0CF9a22E790D89b8e58469f217b50bB4c3aB068C";
const VAI_NEW = "0xA52f2a56aBb7cbDD378bC36c6088fAfEaf9AC423";
const VRT_NEW = "0xeA98E94d35120b23F9f9F20A7314804D4AB491f1";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const MULTISIG = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const LAST_ACCRUING_BLOCK = "29108355";

export const vip127 = () => {
  const meta = {
    version: "v2",
    title: "VIP-127 Vault Upgrades",
    description: `
    Accept the ownership of the VRTVault contract (previously we had to execute a multisig TX to offer this change)
      the new owner will be the Normal timelock contract (0x939bd8d64c0a9583a7dcea9933f7b21697ab6396)

    Upgrade the implementations of the three vaults
      Address of the XVSVault proxy in main net: https://bscscan.com/address/0x051100480289e704d20e9db4804837068f3f9204
      Address of the VRTVault proxy in main net: https://bscscan.com/address/0x98bF4786D72AAEF6c714425126Dd92f149e3F334
      Address of the VAIVault proxy in main net: https://bscscan.com/address/0x0667eed0a0aab930af74a3dfedd263a73994f216

    Authorize the Fast-track and Critical timelock contracts to invoke the admin functions in the vaults, specifically for the following functions:
      XVSVault:
        pause
        resume
      VRTVault
        pause
        resume
      VAIVault
        pause
        resume
    Authorize the Normal timelock contracts to invoke the admin functions in the vaults, specifically for the following functions:
      XVSVault:
        add(address,uint256,address,uint256,uint256)
        set(address,uint256,uint256)
        setRewardAmountPerBlock(address,uint256)
        setWithdrawalLockingPeriod(address,uint256,uint256)
      VRTVault:
        withdrawBep20(address,address,uint256)
      
    Set the lastAcrruingBlock in VRTVault to 29108355, so after this block no rewards will be accrued in the VRT Vault.
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: VRT_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
      },

      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [XVS_NEW],
      },

      {
        target: VRT_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [VRT_NEW],
      },

      {
        target: VAI_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [VAI_NEW],
      },

      {
        target: XVS_NEW,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },

      {
        target: VRT_NEW,
        signature: "_become(address)",
        params: [VRT_VAULT_PROXY],
      },

      {
        target: VAI_NEW,
        signature: "_become(address)",
        params: [VAI_VAULT_PROXY],
      },

      {
        target: VAI_VAULT_PROXY,
        signature: "setAccessControl(address)",
        params: [ACM],
      },

      {
        target: XVS_VAULT_PROXY,
        signature: "setAccessControl(address)",
        params: [ACM],
      },

      {
        target: VRT_VAULT_PROXY,
        signature: "setAccessControl(address)",
        params: [ACM],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "pause()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "pause()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "pause()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "pause()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "resume()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "resume()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "resume()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "resume()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "set(address,uint256,uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "pause()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "pause()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "pause()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "pause()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "resume()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "resume()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "resume()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_VAULT_PROXY, "resume()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "pause()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "pause()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "pause()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "pause()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "resume()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "resume()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "resume()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "resume()", MULTISIG],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "withdrawBep20(address,address,uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VRT_VAULT_PROXY, "setLastAccruingBlock(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: VRT_VAULT_PROXY,
        signature: "setLastAccruingBlock(uint256)",
        params: [LAST_ACCRUING_BLOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
