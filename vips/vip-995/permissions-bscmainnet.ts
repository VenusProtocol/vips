import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

export const HUB_NAV_SENTINEL = "0x26E9497384bC4d123b9e1C530E2bC3A0dF49d2AB";

export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const VENUS_MULTISIG = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";

export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";

const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";
export const CENTRIFUGE_SOURCE_USDC = "0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c";
const CORE_SOURCE_U = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const FLUX_SOURCE_U = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";
const FRV_SOURCE_U = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

const HUBS = [HUB_USDT, HUB_USDC, HUB_U];

/// Every YieldGroup registered on the three Hubs
const YIELD_GROUPS = [
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDC,
  FLUX_SOURCE_USDC,
  FRV_SOURCE_USDC,
  CENTRIFUGE_SOURCE_USDC,
  CORE_SOURCE_U,
  FLUX_SOURCE_U,
  FRV_SOURCE_U,
];

const EBRAKE_HUB_ACTIONS = ["pauseHub(address)", "pauseHubYieldGroup(address)", "pauseHubResource(address,address)"];

const SENTINEL_SETTERS = [
  "setTrustedKeeper(address,bool)",
  "setHubNavConfig(address,address,uint16,uint16,uint256)",
  "setNavMonitoringEnabled(address,address,bool)",
];

export const EBRAKE_OPERATORS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, VENUS_MULTISIG];

export const SENTINEL_ADMINS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];

const PERMISSION_SETS = [
  // EBrake's three Hub actions land as these calls, checked by the Hub and the YieldGroup themselves
  { contracts: HUBS, signatures: ["pauseHub()", "pauseYieldGroup(address)"], accounts: [EBRAKE] },
  { contracts: YIELD_GROUPS, signatures: ["pauseResource(address)"], accounts: [EBRAKE] },
  { contracts: [EBRAKE], signatures: EBRAKE_HUB_ACTIONS, accounts: EBRAKE_OPERATORS },
  { contracts: [HUB_NAV_SENTINEL], signatures: SENTINEL_SETTERS, accounts: SENTINEL_ADMINS },
  // The sentinel's one write: `handleNavGuardDeviation` pauses the breaching resource's Hub through EBrake
  { contracts: [EBRAKE], signatures: ["pauseHub(address)"], accounts: [HUB_NAV_SENTINEL] },
];

export const PERMISSIONS = PERMISSION_SETS.flatMap(({ contracts, signatures, accounts }) =>
  contracts.flatMap(contract =>
    signatures.flatMap(signature => accounts.map(account => ({ contract, signature, account }))),
  ),
);
