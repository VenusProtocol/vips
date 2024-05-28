import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
export const NEW_XVS_IMPLEMENTATION = "0xc48B9A9455E11F9327046e5cCb17E9f63AE3D037";

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const SEPOLIA_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds

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
      params: [false, SEPOLIA_BLOCKS_PER_YEAR],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", sepolia.GUARDIAN],
    },
  ]);
};

export default vip030;
