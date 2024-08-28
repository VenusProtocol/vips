import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
export const VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x13B3f65C0e2C64528F678B3C78ccac7341a2A66C";
export const NEW_VTOKEN_IMPLEMENTATION = "0xE5A008B6A0bAB405343B3ABe8895966EAaFb5790";
export const NATIVE_TOKEN_GATEWAY_VWETH_CORE = "0x044dd75b9E043ACFD2d6EB56b6BB814df2a9c809";
export const NATIVE_TOKEN_GATEWAY_VWETH_LST = "0xBC1471308eb2287eBE137420Eb1664A964895D21";
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const vip008 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_VWETH_CORE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_VWETH_LST,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip008;
