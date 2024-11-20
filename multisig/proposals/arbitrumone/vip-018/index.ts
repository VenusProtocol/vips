import { makeProposal } from "src/utils";

import { CONVERTER_NETWORK, PLP, USDC, USDT, WBTC, WETH, XVS_VAULT_TREASURY } from "./addresses";
import {
  acceptOwnershipCommandsAllConverters,
  callPermissionCommandsAllConverter,
  setConverterNetworkCommands,
} from "./commands";

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
    ...callPermissionCommandsAllConverter,
    ...setConverterNetworkCommands,
  ]);
};

export default vip018;
