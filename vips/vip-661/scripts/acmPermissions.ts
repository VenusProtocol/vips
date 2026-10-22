import {
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_U,
  CORE_SOURCE_USDC,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_U,
  FLUX_SOURCE_USDC,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_U,
  FRV_SOURCE_USDC,
  FRV_SOURCE_USDT,
  GUARDIAN,
  KEEPER,
  NORMAL_TIMELOCK,
  OPERATOR,
} from "../bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
  EMERGENCY,
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

export const LIVE_SOURCES = [
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  CORE_SOURCE_USDC,
  FLUX_SOURCE_USDC,
  FRV_SOURCE_USDC,
  CORE_SOURCE_U,
  FLUX_SOURCE_U,
  FRV_SOURCE_U,
];

// The one source of truth for what this proposal grants: the loading script stores exactly this, and
// the simulation seeds and asserts against exactly this.
export const buildPermissions = (): Permission[] => [
  ...(
    [
      [CENTRIFUGE_GOVERNANCE, NORMAL_TIMELOCK],
      [CENTRIFUGE_OPERATOR, OPERATOR],
      [CENTRIFUGE_CLAIMS, KEEPER],
      [CENTRIFUGE_GUARDIAN, GUARDIAN],
    ] as [string[], string][]
  ).flatMap(([sigs, account]) =>
    sigs.map(functionSig => ({ contractAddress: CENTRIFUGE_SOURCE_USDT, functionSig, account })),
  ),
  ...LIVE_SOURCES.flatMap(contractAddress =>
    EMERGENCY.flatMap(functionSig => [OPERATOR, GUARDIAN].map(account => ({ contractAddress, functionSig, account }))),
  ),
];
