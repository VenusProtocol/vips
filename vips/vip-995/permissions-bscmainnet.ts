import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { SPOKE_SOURCE_U, SPOKE_SOURCE_USDC, SPOKE_SOURCE_USDT } from "../vip-669/addresses/bscmainnet";
import { SPOKE_SOURCE_GRANTS } from "../vip-669/permissions-bscmainnet";

const { FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;
const WILDCARD = ethers.constants.AddressZero;

// ────────────────────────────────────────────────────────────────
// Addresses
// ────────────────────────────────────────────────────────────────
export const HUB_NAV_SENTINEL = "0x26E9497384bC4d123b9e1C530E2bC3A0dF49d2AB";
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const VENUS_TEAM_MULTISIG = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";
export const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

export const HUBS = [
  "0x18AfDACF30F8671021dec4b78297E39d2FE87226", // USDT
  "0x9D2D9592cF8DFbf59107fAab703d08494BE14617", // USDC
  "0x0e5AA174d4F31b757a237eb1999DE151596788B0", // U
];
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";
export const CENTRIFUGE_SOURCE_USDC = "0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c";
const CORE_AND_FLUX_SOURCES = [
  "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B", // Core USDT
  "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef", // Core USDC
  "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3", // Core U
  "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14", // Flux USDT
  "0xA65bB4b20542268B64CF08871a98D75342AFE927", // Flux USDC
  "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616", // Flux U
];
const YIELD_GROUPS = [
  ...CORE_AND_FLUX_SOURCES,
  "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7", // FRV USDT
  "0x438388847eE16850Ab4f5b82dc7954c0d043B716", // FRV USDC
  "0x30908eddB9E94add7AC9944a0adda66d80B89143", // FRV U
  CENTRIFUGE_SOURCE_USDT,
  CENTRIFUGE_SOURCE_USDC,
];

// ────────────────────────────────────────────────────────────────
// 1. EBrake and sentinel roles
// ────────────────────────────────────────────────────────────────
/// What EBrake's Hub actions forward to, checked by each Hub and YieldGroup against its own address
const HUB_SIDE_PAUSES = ["pauseHub()", "pauseYieldGroup(address)", "pauseResource(address)"];

const EBRAKE_HUB_ACTIONS = ["pauseHub(address)", "pauseHubYieldGroup(address)", "pauseHubResource(address,address)"];

const SENTINEL_SETTERS = [
  "setTrustedKeeper(address,bool)",
  "setHubNavConfig(address,address,uint16,uint16,uint256)",
  "setNavMonitoringEnabled(address,address,bool)",
];

export const EBRAKE_OPERATORS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, VENUS_TEAM_MULTISIG];
export const HUB_SENTINEL_GRANTEES = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];

const EBRAKE_AND_SENTINEL_ROLES = [
  // Wildcard so a Hub or YieldGroup added later is covered without a new grant
  { contracts: [WILDCARD], signatures: HUB_SIDE_PAUSES, accounts: [EBRAKE] },
  { contracts: [EBRAKE], signatures: EBRAKE_HUB_ACTIONS, accounts: EBRAKE_OPERATORS },
  { contracts: [HUB_NAV_SENTINEL], signatures: SENTINEL_SETTERS, accounts: HUB_SENTINEL_GRANTEES },
  // The sentinel's one write: `handleNavGuardDeviation` pauses the breaching resource's Hub through EBrake
  { contracts: [EBRAKE], signatures: ["pauseHub(address)"], accounts: [HUB_NAV_SENTINEL] },
];

// ────────────────────────────────────────────────────────────────
// 2. Normal Timelock and Guardian pause and unpause: per-contract grants replaced by wildcards
// ────────────────────────────────────────────────────────────────
const HUB_SIDE_UNPAUSES = ["unpauseHub()", "unpauseYieldGroup(address)", "unpauseResource(address)"];

const PAUSE_WILDCARD_ROLES = [
  { contracts: [WILDCARD], signatures: HUB_SIDE_PAUSES, accounts: [NORMAL_TIMELOCK, GUARDIAN] },
  { contracts: [WILDCARD], signatures: HUB_SIDE_UNPAUSES, accounts: [NORMAL_TIMELOCK, GUARDIAN] },
];
const PAUSE_WILDCARD_REVOKES = [
  { contracts: HUBS, signatures: ["pauseHub()", "pauseYieldGroup(address)"], accounts: [NORMAL_TIMELOCK, GUARDIAN] },
  { contracts: YIELD_GROUPS, signatures: ["pauseResource(address)"], accounts: [NORMAL_TIMELOCK, GUARDIAN] },
  { contracts: HUBS, signatures: ["unpauseHub()", "unpauseYieldGroup(address)"], accounts: [NORMAL_TIMELOCK] },
  { contracts: YIELD_GROUPS, signatures: ["unpauseResource(address)"], accounts: [NORMAL_TIMELOCK, GUARDIAN] },
];

// ────────────────────────────────────────────────────────────────
// 3. YieldGroup roles: per-contract grants replaced by wildcards
// ────────────────────────────────────────────────────────────────
const YIELD_GROUP_ROLES = [
  {
    contracts: [WILDCARD],
    signatures: [
      "addResource(address,address)",
      "removeResource(address)",
      "updateResourceAdapter(address,address)",
      "setInnerDepositQueue(address[])",
      "setInnerWithdrawQueue(address[])",
      "sweep(address,address)",
      "raiseResourceCap(address,uint256)",
      "lowerResourceCap(address,uint256)",
      "setBlocksPerYear(uint256)",
    ],
    accounts: [NORMAL_TIMELOCK],
  },
  { contracts: [WILDCARD], signatures: ["updateResourceAdapter(address,address)"], accounts: [GUARDIAN] },
  {
    contracts: [WILDCARD],
    signatures: [
      "setInnerDepositQueue(address[])",
      "setInnerWithdrawQueue(address[])",
      "pauseResource(address)",
      "unpauseResource(address)",
      "raiseResourceCap(address,uint256)",
      "lowerResourceCap(address,uint256)",
    ],
    accounts: [HUB_OPERATOR],
  },
];
const YIELD_GROUP_TIMELOCK_REVOKES = [
  {
    contracts: YIELD_GROUPS,
    signatures: [
      "addResource(address,address)",
      "removeResource(address)",
      "updateResourceAdapter(address,address)",
      "setInnerDepositQueue(address[])",
      "setInnerWithdrawQueue(address[])",
      "sweep(address,address)",
    ],
    accounts: [NORMAL_TIMELOCK],
  },
  {
    contracts: CORE_AND_FLUX_SOURCES,
    signatures: ["raiseResourceCap(address,uint256)", "lowerResourceCap(address,uint256)", "setBlocksPerYear(uint256)"],
    accounts: [NORMAL_TIMELOCK],
  },
  { contracts: HUBS, signatures: ["sweep(address,address)"], accounts: [NORMAL_TIMELOCK] },
];
const YIELD_GROUP_GUARDIAN_AND_OPERATOR_REVOKES = [
  { contracts: YIELD_GROUPS, signatures: ["updateResourceAdapter(address,address)"], accounts: [GUARDIAN] },
  {
    contracts: YIELD_GROUPS,
    signatures: [
      "setInnerDepositQueue(address[])",
      "setInnerWithdrawQueue(address[])",
      "pauseResource(address)",
      "unpauseResource(address)",
    ],
    accounts: [HUB_OPERATOR],
  },
  {
    contracts: CORE_AND_FLUX_SOURCES,
    signatures: ["raiseResourceCap(address,uint256)", "lowerResourceCap(address,uint256)"],
    accounts: [HUB_OPERATOR],
  },
];

// ────────────────────────────────────────────────────────────────
// 4. Spoke sources: the 20 per-contract grants VIP-669 gives each, replaced by the wildcards above
// ────────────────────────────────────────────────────────────────
export const SPOKE_SOURCES = [SPOKE_SOURCE_USDT, SPOKE_SOURCE_USDC, SPOKE_SOURCE_U];
const SPOKE_SOURCE_REVOKES = SPOKE_SOURCES.flatMap(contract =>
  SPOKE_SOURCE_GRANTS.map(({ role, account }) => ({ contract, signature: role, account })),
);

// One (contract, signature, account) per combination in each set
const expand = (sets: { contracts: string[]; signatures: string[]; accounts: string[] }[]) =>
  sets.flatMap(({ contracts, signatures, accounts }) =>
    contracts.flatMap(contract =>
      signatures.flatMap(signature => accounts.map(account => ({ contract, signature, account }))),
    ),
  );

// Grants, in proposal order
export const GRANT_PERMISSIONS = expand([...EBRAKE_AND_SENTINEL_ROLES, ...PAUSE_WILDCARD_ROLES, ...YIELD_GROUP_ROLES]);

// Revokes of the per-contract grants the wildcards replace, one aggregator batch each
export const REVOKE_BATCHES = [
  expand(PAUSE_WILDCARD_REVOKES), // 62
  expand(YIELD_GROUP_TIMELOCK_REVOKES), // 87
  expand(YIELD_GROUP_GUARDIAN_AND_OPERATOR_REVOKES), // 67
  SPOKE_SOURCE_REVOKES, // 60
];
