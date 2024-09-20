import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const REWARD_TOKEN_SPEED = "578703703703703";
export const XVS = zksyncmainnet.XVS;
export const STORE_XVS_REWARD_AMOUNT = parseUnits("6000", 18);
export const RD_XVS_REWARD_AMOUNT = parseUnits("30000", 18);
export const XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const XVS_VAULT_PROXY = "0xbbB3C88192a5B0DB759229BeF49DcD1f168F326F";
export const REWARD_DISTRIBUTOR_CORE_0 = "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894";
export const COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_E_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const VUSDT_CORE = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
export const VWETH_CORE = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

export const vip010 = () => {
  return makeProposal([
    // ACM Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        zksyncmainnet.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ethers.constants.AddressZero,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        zksyncmainnet.GUARDIAN,
      ],
    },
    // Configure XVS vault rewards
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [zksyncmainnet.XVS, STORE_XVS_REWARD_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [zksyncmainnet.XVS, REWARD_TOKEN_SPEED],
    },

    // Configure pool rewards
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [zksyncmainnet.XVS, RD_XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
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
        ["740740740740740", "740740740740740", "555555555555554", "1111111111111110", "555555555555554"],
        ["185185185185184", "185185185185184", "138888888888888", "277777777777776", "138888888888888"],
      ],
    },
    // transfer 1500 XVS to community wallet
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [zksyncmainnet.XVS, parseUnits("1500", 18), "0xc444949e0054a23c44fc45789738bdf64aed2391"],
    },
  ]);
};

export default vip010;
