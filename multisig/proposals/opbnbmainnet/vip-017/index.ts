import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
export const COMPTROLLER_BEACON = "0x11C3e19236ce17729FC66b74B537de00C54d44e7";
export const VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0xbA12d0BFC59fd29C44795FfFa8A3Ccc877A41325";
export const NEW_VTOKEN_IMPLEMENTATION = "0x6218d22aE20004e77aDd203699A5477697F945c6";
export const NATIVE_TOKEN_GATEWAY = "0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f";

const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

const vip017 = () => {
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
      target: NATIVE_TOKEN_GATEWAY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip017;
