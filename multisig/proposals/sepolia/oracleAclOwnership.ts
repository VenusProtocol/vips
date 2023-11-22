import { makeProposal } from "../../../src/utils";
import { ADDRESSES, ZERO_ADDRESS } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;
export const oracleAclOwnership = () => {
  return makeProposal([
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "pause()", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "unpause()", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setOracle(address,address,uint8)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "enableOracle(address,uint8,bool)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setTokenConfig(TokenConfig)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setDirectPrice(address,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setValidateConfig(ValidateConfig)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMaxStalePeriod(string,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setSymbolOverride(string,string)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setUnderlyingPythOracle(address)", sepoliaContracts.TIMELOCK],
    },
    { target: sepoliaContracts.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: sepoliaContracts.CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: sepoliaContracts.BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
  ]);
};
