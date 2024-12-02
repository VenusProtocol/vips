import { makeProposal } from "src/utils";

import { CONVERTER_NETWORK } from "./Addresses";
import {
  acceptOwnershipCommandsAllConverters,
  callPermissionCommandsAllConverter,
  setConverterNetworkCommands,
} from "./commands";

export const XVS_VAULT_TREASURY = "0x309b71a417dA9CfA8aC47e6038000B1739d9A3A6";

const vip019 = () => {
  return makeProposal([
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

export default vip019;
