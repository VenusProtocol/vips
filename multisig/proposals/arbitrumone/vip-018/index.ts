import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

import { ACM, CONVERTER_NETWORK, PLP, USDC, USDT, WBTC, WETH, XVS_VAULT_TREASURY } from "./addresses";
import { acceptOwnershipCommandsAllConverters, callPermissionCommands, setConverterNetworkCommands } from "./commands";

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
    ...callPermissionCommands,
    ...setConverterNetworkCommands,
  ]);
};

export default vip018;
