import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
export const NEW_XVS_IMPLEMENTATION = "0x437042777255A1f25BE60eD25C814Dea6E43bC28";

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const ETHEREUM_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds

const vip030 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "_setPendingImplementation(address)",
      params: [NEW_XVS_IMPLEMENTATION],
    },
    {
      target: NEW_XVS_IMPLEMENTATION,
      signature: "_become(address)",
      params: [XVS_VAULT_PROXY],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "initializeTimeManager(bool,uint256)",
      params: [false, ETHEREUM_BLOCKS_PER_YEAR],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip030;
