import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;
const WILDCARD = ethers.constants.AddressZero;

export const HUB_NAV_SENTINEL = "0x26E9497384bC4d123b9e1C530E2bC3A0dF49d2AB";
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const VENUS_TEAM_MULTISIG = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";

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

const PERMISSION_SETS = [
  // Wildcard so a Hub or YieldGroup added later is covered without a new grant
  { contracts: [WILDCARD], signatures: HUB_SIDE_PAUSES, accounts: [EBRAKE] },
  { contracts: [EBRAKE], signatures: EBRAKE_HUB_ACTIONS, accounts: EBRAKE_OPERATORS },
  { contracts: [HUB_NAV_SENTINEL], signatures: SENTINEL_SETTERS, accounts: HUB_SENTINEL_GRANTEES },
  // The sentinel's one write: `handleNavGuardDeviation` pauses the breaching resource's Hub through EBrake
  { contracts: [EBRAKE], signatures: ["pauseHub(address)"], accounts: [HUB_NAV_SENTINEL] },
];

export const PERMISSIONS = PERMISSION_SETS.flatMap(({ contracts, signatures, accounts }) =>
  contracts.flatMap(contract =>
    signatures.flatMap(signature => accounts.map(account => ({ contract, signature, account }))),
  ),
);
