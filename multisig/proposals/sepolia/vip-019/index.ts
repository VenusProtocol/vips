import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const NEW_XVS_IMPLEMENTATION = "0xA6814c7c8Da831214b5488e57d11b1a1071761c9";
const SEPOLIA_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const vip019 = () => {
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
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", sepolia.GUARDIAN],
    },
  ]);
};

export default vip019;
