import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const SWAP_HELPER = "0xf7Cfd0eDfAC7AA473813559b372297332EdEbB8B";
export const LEVERAGE_STRATEGIES_MANAGER = "0xE852204A757A3Ee9Dfc5d608b7038f962f393706";
export const RELATIVE_POSITION_MANAGER = "0xcB84425698B9426b5Edd9Ed25eA0116aA0c2Ce7F";
export const POSITION_ACCOUNT = "0x599B79742AB82700Bc828cc44e0Ae22FBbB88e7c";

export const TIMELOCKS_AND_GURDIAN = [
  bsctestnet.NORMAL_TIMELOCK,
  bsctestnet.FAST_TRACK_TIMELOCK,
  bsctestnet.CRITICAL_TIMELOCK,
  bsctestnet.GUARDIAN,
];

const giveAcmPermissions = (fnSignature: string, timelocks = TIMELOCKS_AND_GURDIAN) =>
  timelocks.map(timelock => ({
    target: bsctestnet.ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [RELATIVE_POSITION_MANAGER, fnSignature, timelock],
  }));

export const vip589 = () => {
  const meta = {
    version: "v2",
    title: "VIP-589 [BNB Chain] Add U market to the stablecoin Emode pool",
    description: "VIP-589 [BNB Chain] Add U market to the stablecoin Emode pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SWAP_HELPER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LEVERAGE_STRATEGIES_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [LEVERAGE_STRATEGIES_MANAGER, true],
      },
      // Already set in this contract
      //   {
      //     target: RELATIVE_POSITION_MANAGER,
      //     signature: "setPositionAccountImplementation(address)",
      //     params: [POSITION_ACCOUNT],
      //   },
      // ACM permissions
      ...giveAcmPermissions("pause()"),
      ...giveAcmPermissions("unpause()"),
      ...giveAcmPermissions("setPositionAccountImplementation(address)"),
      ...giveAcmPermissions("addDSAVToken(address)"),
      ...giveAcmPermissions("setDSAVTokenActive(uint8,bool)"),
      ...giveAcmPermissions("executePositionAccountCall(address,address[],bytes[])"),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
