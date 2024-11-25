import { makeProposal } from "src/utils";

import { CONVERTER_NETWORK, PLP, USDC, USDT, WBTC, WETH, XVS_VAULT_TREASURY, ACM } from "./addresses";
import {
  acceptOwnershipCommandsAllConverters,
  callPermissionCommandsAllConverter,
  setConverterNetworkCommands,
} from "./commands";

import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { arbitrumone } = NETWORK_ADDRESSES;
const vip018 = () => {
  return makeProposal([
    {
      target: PLP,
      signature: "initializeTokens(address[])",
      params: [[WETH, WBTC, USDC, USDT]],
    },
    ...acceptOwnershipCommandsAllConverters,
    {
      target: XVS_VAULT_TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.GUARDIAN],
    },
    ...callPermissionCommandsAllConverter,
    ...setConverterNetworkCommands,
  ]);
};

export default vip018;
