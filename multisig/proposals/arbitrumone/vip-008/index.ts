import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const XVS_VAULT_PROXY = "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4";
export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const XVS_VAULT_REWARDS_SPEED = "578703703703703"; // 1500 xvs/month
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const XVS_AMOUNT = parseUnits("4500", 18);

const VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

export const REWARD_DISTRIBUTOR_CORE_0 = "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a";

export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

export const VWETH_CORE = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const VUSDT_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const VUSDC_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const VWBTC_CORE = "0xaDa57840B372D4c28623E87FC175dE8490792811";
export const VARB_CORE = "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6";

const vip008 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        ZERO_ADDRESS,
        "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
        arbitrumone.NORMAL_TIMELOCK,
      ],
    },
    // CORE POOL REWARDS
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, parseUnits("10200", 18), REWARD_DISTRIBUTOR_CORE_0],
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
      params: [
        [VWETH_CORE, VARB_CORE, VUSDT_CORE, VUSDC_CORE, VWBTC_CORE],
        ["65586419753086", "65586419753086", "131172839506172", "131172839506172", "131172839506172"],
        ["98379629629629", "98379629629629", "196759259259258", "196759259259258", "196759259259258"],
      ],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_AMOUNT, XVS_STORE],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [XVS, XVS_VAULT_REWARDS_SPEED],
    },
  ]);
};

export default vip008;
