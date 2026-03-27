import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const RELATIVE_POSITION_MANAGER = "0x1525D804DFff218DcC8B9359940F423209356C42";
export const POSITION_ACCOUNT = "0xa75C5b438226bc73BDCc83408E7Aa41771b33E2C";

export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const TIMELOCKS_AND_GUARDIAN = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
  bscmainnet.GUARDIAN,
];

const giveAcmPermissions = (fnSignature: string, timelocks = TIMELOCKS_AND_GUARDIAN) =>
  timelocks.map(timelock => ({
    target: bscmainnet.ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [RELATIVE_POSITION_MANAGER, fnSignature, timelock],
  }));

export const vip610 = () => {
  const meta = {
    version: "v2",
    title: "VIP-610 [BNB Chain] Configure Relative Position Manager",
    description: "VIP-610 [BNB Chain] Configure Relative Position Manager",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      // ACM permissions
      ...giveAcmPermissions("partialPause()"),
      ...giveAcmPermissions("partialUnpause()"),
      ...giveAcmPermissions("completePause()"),
      ...giveAcmPermissions("completeUnpause()"),
      ...giveAcmPermissions("setPositionAccountImplementation(address)", [bscmainnet.NORMAL_TIMELOCK]),
      ...giveAcmPermissions("setProportionalCloseTolerance(uint256)"),
      ...giveAcmPermissions("addDSAVToken(address)"),
      ...giveAcmPermissions("setDSAVTokenActive(uint8,bool)"),
      ...giveAcmPermissions("executePositionAccountCall(address,address[],bytes[])"),
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "setPositionAccountImplementation(address)",
        params: [POSITION_ACCOUNT],
      },
      // Add DSA vTokens (USDC, USDT)
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDC],
      },
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip610;
