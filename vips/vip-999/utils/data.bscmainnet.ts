import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bscmainnet } = NETWORK_ADDRESSES;

// Existing addresses
export const UNITROLLER = bscmainnet.UNITROLLER; // Core Pool Comptroller (Diamond)
export const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
export const LIQUIDATOR_PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
export const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
export const LEVERAGE_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4"; // DefaultProxyAdmin
export const ACCESS_CONTROL_MANAGER = bscmainnet.ACCESS_CONTROL_MANAGER;

// The new market-filtered seizeVenus overload is ACM-gated under this signature. Granted to the same set as the existing
// permission plus the critical guardian.
export const SEIZE_VENUS_FILTERED_SIGNATURE = "seizeVenus(address[],address,address[])";
export const SEIZE_VENUS_PERMISSION_GRANTEES = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
  bscmainnet.CRITICAL_GUARDIAN,
];

// Newly deployed implementations — TODO: replace placeholders with the real deployed addresses.
export const NEW_DIAMOND = "0x7777777777777777777777777777777777777777"; // Diamond (Unitroller implementation)
export const NEW_MARKET_FACET = "0x8888888888888888888888888888888888888888";
export const NEW_POLICY_FACET = "0x9999999999999999999999999999999999999999";
export const NEW_REWARD_FACET = "0x1111111111111111111111111111111111111111";
export const NEW_SETTER_FACET = "0x1010101010101010101010101010101010101010";
export const NEW_FLASHLOAN_FACET = "0x1212121212121212121212121212121212121212";
export const NEW_COMPTROLLER_LENS = "0x2222222222222222222222222222222222222222";
export const NEW_LIQUIDATOR_IMPL = "0x3333333333333333333333333333333333333333";
export const NEW_VTOKEN_DELEGATE = "0x5555555555555555555555555555555555555555";
export const NEW_LEVERAGE_IMPL = "0x4444444444444444444444444444444444444444";

// Selectors currently owned by each Core Pool Comptroller facet (diamond loupe). Replaced onto the
// recompiled facets; the RewardFacet additionally gains the two new overloads.
export const MARKET_FACET_SELECTORS = [
  "0xa76b3fda",
  "0x89c13be0",
  "0x929fe9a1",
  "0xd0d13036",
  "0xd585c3c6",
  "0xc2998238",
  "0xf9682732",
  "0xede4edd0",
  "0xb0772d0b",
  "0xabfceffc",
  "0x23617585",
  "0xafd3783b",
  "0x19ef3e8b",
  "0xd686e9ee",
  "0x7b86e42c",
  "0x63e0d634",
  "0xf02fdf97",
  "0x007e3dd2",
  "0x3d98a1e5",
  "0x0ef332ca",
  "0xc488847b",
  "0xa78dc775",
  "0x8e8f294b",
  "0x3093c11e",
  "0xd137f36e",
  "0xcab4f84c",
  "0x0686dab6",
  "0xddbf54fd",
  "0xd463654c",
  "0x4d99c776",
  "0xc5b4db55",
];
export const POLICY_FACET_SELECTORS = [
  "0xead1a8a0",
  "0xda3d454c",
  "0x5c778605",
  "0x5ec88c79",
  "0x528a174c",
  "0x4e79238f",
  "0x5fc7e71e",
  "0x47ef3b3b",
  "0x4ef4c3e1",
  "0x41c728b9",
  "0xeabe7d91",
  "0x51dff989",
  "0x24008a62",
  "0x1ededc91",
  "0xd02f7351",
  "0x6d35bf91",
  "0xbdcdc258",
  "0x6a56947e",
];
export const REWARD_FACET_EXISTING_SELECTORS = [
  "0xa7604b41", // _grantXVS(address,uint256)
  "0x70bf66f0", // claimVenus(address[],address[],bool,bool,bool)
  "0x86df31ee", // claimVenus(address,address[])
  "0xadcd5fb9", // claimVenus(address)
  "0xd09c54ba", // claimVenus(address[],address[],bool,bool)
  "0x7858524d", // claimVenusAsCollateral(address)
  "0xededbae6", // getXVSVTokenAddress()
  "0x655f0725", // seizeVenus(address[],address)
  "0xe85a2960", // actionPaused(address,uint8)
  "0xbf32442d", // getXVSAddress()
];
export const REWARD_FACET_NEW_SELECTORS = [
  "0xc2dbfc50", // claimVenusAsCollateral(address,address[])
  "0xf74c8f31", // seizeVenus(address[],address,address[])
];
export const SETTER_FACET_SELECTORS = [
  "0xf519fc30",
  "0x2b5d790c",
  "0x317b0b77",
  "0x9bf34cbb",
  "0x522c656b",
  "0x17db2163",
  "0xbb857450",
  "0x607ef6c1",
  "0x51a485e4",
  "0x5f5af1aa",
  "0x55ee1fe1",
  "0x9460c8b5",
  "0x2a6a6065",
  "0xd24febad",
  "0x9cfdd9e6",
  "0x2ec04124",
  "0x4e0853db",
  "0x6662c7c9",
  "0x919a3736",
  "0x4ef233fc",
  "0x24aaa220",
  "0x7938146f",
  "0x12348e96",
  "0x5cc4fdeb",
  "0x9159b177",
  "0xd6ad5c39",
  "0x8b3113f6",
  "0xa89766dd",
  "0x35439240",
  "0x9bd8f6e8",
  "0x186db48f",
  "0xd136af44",
  "0xfd51a3ad",
  "0x4964f48c",
  "0xb88d846b",
  "0x530e784f",
  "0xc32094c7",
  "0x42adb211",
  "0xfe40768f",
];
export const FLASHLOAN_FACET_SELECTORS = ["0x5544ed9c"];

// Core Pool markets sharing the standard VBep20Delegate; repointed at NEW_VTOKEN_DELEGATE. Excluded: vBNB
export const VTOKENS_TO_UPGRADE: Record<string, string> = {
  vUSDC: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  vUSDT: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  vBUSD: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  vXVS: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  vBTC: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  vETH: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  vLTC: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
  vXRP: "0xB248a295732e0225acd3337607cc01068e3b9c10",
  vBCH: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
  vDOT: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
  vLINK: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
  vDAI: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
  vFIL: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
  vBETH: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
  vADA: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
  vDOGE: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
  vMATIC: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
  vCAKE: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
  vAAVE: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
  vTUSDOLD: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
  vTRX: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
  vTRXOLD: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
  vWBETH: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
  vTUSD: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
  vUNI: "0x27FF564707786720C71A2e5c1490A63266683612",
  vFDUSD: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
  vTWT: "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc",
  vTHE: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f",
  vSolvBTC: "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea",
  vSOL: "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC",
  vlisUSD: "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab",
  vsUSDe: "0x699658323d58eE25c69F1a29d476946ab011bD18",
  vUSDe: "0x74ca6930108F775CC667894EEa33843e691680d7",
  vUSD1: "0x0C1DA220D301155b87318B90692Da8dc43B67340",
  vxSolvBTC: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
  vasBNB: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
  vWBNB: "0x6bCa74586218dB34cdB402295796b79663d816e9",
  vslisBNB: "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc",
  vU: "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E",
  "vPT-clisBNB-25JUN2026": "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e",
  vXAUM: "0x92e6Ea74a1A3047DabF4186405a21c7D63a0612A",
};
