import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const NEW_XVS_IMPLEMENTATION = "0x43E5e72515140c147a72FB21021CF11dA1eBCe9a";
const ETHEREUM_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

const vip021 = () => {
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
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip021;
