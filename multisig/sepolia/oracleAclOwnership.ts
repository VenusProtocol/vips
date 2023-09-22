import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { ADDRESSES, ZERO_ADDRESS } from "../helper/config";

const { sepoliaContracts } = ADDRESSES;
export const oracleAclOwnership = () => {
  const meta = {
    version: "v2",
    title: "Sepolia Oracle Configuration",
    description: `
      This Multisig TX configures the oracle deployed on sepolia:
	   - sets the required access controls
	   - accepts ownership from deployer to multisig
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
