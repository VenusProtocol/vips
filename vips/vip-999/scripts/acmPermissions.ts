import {
  CENTRIFUGE_SOURCE_USDT,
  FAST_TRACK_TIMELOCK,
  GUARDIAN,
  KEEPER,
  NORMAL_TIMELOCK,
  OPERATOR,
} from "../bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_FAST_TRACK,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
} from "../permissions-bscmainnet";

// `ACMCommandsAggregator.Permission`: the aggregator calls `giveCallPermission` with these itself, so
// nothing here is encoded calldata.
export type Permission = { contractAddress: string; functionSig: string; account: string };

export const ACM_AGGREGATOR_ABI = [
  "function addGrantPermissions((address contractAddress, string functionSig, address account)[] permissions)",
  "function executeGrantPermissions(uint256 index)",
  "function grantPermissions(uint256 index, uint256 i) view returns (address, string, address)",
  "event GrantPermissionsAdded(uint256 index)",
];

// The one source of truth for what this proposal grants: the loading script stores exactly this, and
// the simulation seeds and asserts against exactly this.
export const buildPermissions = (): Permission[] =>
  (
    [
      [CENTRIFUGE_GOVERNANCE, NORMAL_TIMELOCK],
      [CENTRIFUGE_FAST_TRACK, FAST_TRACK_TIMELOCK],
      [CENTRIFUGE_OPERATOR, OPERATOR],
      [CENTRIFUGE_CLAIMS, KEEPER],
      [CENTRIFUGE_GUARDIAN, GUARDIAN],
    ] as [string[], string][]
  ).flatMap(([sigs, account]) =>
    sigs.map(functionSig => ({ contractAddress: CENTRIFUGE_SOURCE_USDT, functionSig, account })),
  );
