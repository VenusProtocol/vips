// All raw on-chain addresses used by VIP-665, organized as one block per chain. Within each block the
// entries are ordered `common` (categories every chain shares, so the shape cross-references the doc's
// common section) then `unique` (chain-specific values). criticalChanges.ts, cleanup.ts, the VIP and the
// simulations reference these named constants so the plan files stay free of literals. The per-chain
// blocks are the review surface; the `Record<Chain, X>` exports at the bottom are just reassembled from
// them so consumers can keep indexing by chain key.
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import type { RedundantChain } from "./cleanup";
import type { RemoteChain } from "./criticalChanges";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ZERO = "0x0000000000000000000000000000000000000000";

// ===================================================================================================
// bscmainnet (governance hub)
// ===================================================================================================
// -- common: ACM + Critical timelock + Guardians --
export const BNB_ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
export const BNB_CRITICAL = bscmainnet.CRITICAL_TIMELOCK;
// Guardian 1 = CRITICAL_GUARDIAN (swap/grant target), 2 = GUARDIAN (pause), 3 = oracles.
export const BNB_GUARDIANS = {
  guardian1: bscmainnet.CRITICAL_GUARDIAN,
  guardian2: bscmainnet.GUARDIAN,
  guardian3: "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF",
};

// -- unique: contracts this VIP touches on BNB --
// Contracts the action plan is scoped to.
export const BNB_CONTRACTS = {
  Liquidator: "0x0870793286aaDA55D39CE7f82fb2766e8004cF43",
  PegStability_USDT: "0xC138aa4E424D1A8539e8F38Af5a754a2B7c3Cc36",
  Prime: "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC",
  PrimeLiquidityProvider: "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2",
  PrimeV2: "0x059EabA8676b03e4e8f009eFb7F587C28450F50f",
  Unitroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
  VaiUnitroller: "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE",
  VAIVaultProxy: "0x0667Eed0a0aAb930af74a3dfeDD263A73994f216",
  VBNBAdmin: "0x9A7890534d9d91d473F28cB97962d176e2B65f1d",
  VRTVaultProxy: "0x98bF4786D72AAEF6c714425126Dd92f149e3F334",
  XVSVaultProxy: "0x051100480289e704d20e9DB4804837068f3f9204",
  BinanceOracle: "0x594810b741d136f1960141C0d8Fb4a91bE78A820",
  ChainlinkOracle: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
  DeviationBoundedOracle: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A",
  PythOracle: "0xb893E38162f55fb80B18Aa44da76FaDf8E9B2262",
  RedStoneOracle: "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a",
  ResilientOracle: "0x6592b5DE802159F3E74B2486b091D11a8256ab8A",
  USDTChainlinkOracle: "0x22Dc2BAEa32E95AB07C2F5B8F63336CbF61aB6b8",
  BTCBPrimeConverter: "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53",
  ConverterNetwork: "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995",
  ETHPrimeConverter: "0xca430B8A97Ea918fF634162acb0b731445B8195E",
  ProtocolShareReserve: "0xCa01D5A9A248a830E9D93231e791B1afFed7c446",
  RiskFundConverter: "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0",
  RiskFundV2: "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42",
  USDCPrimeConverter: "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b",
  USDTPrimeConverter: "0xD9f101AA67F3D72662609a2703387242452078C3",
  WBNBBurnConverter: "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE",
  XVSVaultConverter: "0xd5b9AE835F4C59272032B3B954417179573331E0",
  XVSVaultTreasury: "0x269ff7818DB317f60E386D2be0B259e1a324a40a",
  Comptroller_DeFi: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
  Comptroller_GameFi: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
  Comptroller_LiquidStakedBNB: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
  Comptroller_Stablecoins: "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571",
  Comptroller_Tron: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
  Shortfall: "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209",
  DeviationSentinel: "0x6599C15cc8407046CD91E5c0F8B7f765fF914870",
  EBrake: "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec",
  Executor: "0xDd541A1b065F9587b01815a390a4d4559D7b630F",
  PancakeSwapOracle: "0x44B72078240A3509979faF450085Fa818401D32E",
  PendlePTVaultAdapter: "0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a",
  RelativePositionManager: "0x1525D804DFff218DcC8B9359940F423209356C42",
  SentinelOracle: "0x58eae0Cf4215590E19860b66b146C5d539cb6f14",
  UniswapOracle: "0x8FD05458faf220B2324c4BFbb29DBC4B3CF6f23f",
  AuxiliaryCommandsAggregator: "0x528A428748dfE73DFcc844176B401475D1831057",
  OmnichainProposalSender: "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6",
  RiskOracle: "0x0E3E51958b0Daa8C57c949675975CBEDd7b5a1a1",
  RiskStewardReceiver: "0x47856bFa74B71d24a5545c7506862B8FddE52baB",
  XVSBridgeAdmin: "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21",
  InstitutionalVaultControllerProxy: "0x6D9e91cB766259af42619c14c994E694E57e6E85",
  LiquidationAdapterProxy: "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd",
};

// Retired / legacy contracts (absent from every deployment file) still holding grants.
export const RETIRED = {
  RiskFundV2: "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42",
  Unitroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
  RiskConfig: "0xBa2a43279a228cf9cD94d072777d8d98e7e0a229",
  RiskSteward: "0xE7252dccd79F2A555E314B9cdd440745b697D562",
  TwapOracle: "0xea2f042e1A4f057EF8A5220e57733AD747ea8867",
};

// Redundant-grant cleanup contracts on BNB (shadowed by an identical wildcard grant).
const BNB_REDUNDANT: Record<string, string> = {
  EBrake: "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec",
  Prime: "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC",
  PrimeLeaderboard: "0x55e2ccF68B7A276dc28AfA107997b8B1Be932c0b",
  PrimeLiquidityProvider: "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2",
  PrimeV2: "0x059EabA8676b03e4e8f009eFb7F587C28450F50f",
  Unitroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
  VBNBAdmin: "0x9A7890534d9d91d473F28cB97962d176e2B65f1d",
  VenusERC4626Factory: "0xC2f7924809830886EB04c6b40725Fd68F1891fA2",
  vUNI: "0x27FF564707786720C71A2e5c1490A63266683612",
};

// ===================================================================================================
// ethereum
// ===================================================================================================
// -- common: ACM + XVS bridge admin + omnichain executor owner --
const ETH_ACM = NETWORK_ADDRESSES.ethereum.ACCESS_CONTROL_MANAGER;
const ETH_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
const ETH_OMNICHAIN_EXECUTOR_OWNER = "0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba";
const ETH_REDUNDANT: Record<string, string> = {
  EBrake: "0xCD09042c5DFFed762998Df9a058ec5944e39949B",
  Prime: "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39",
  PrimeLiquidityProvider: "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872",
  VenusERC4626Factory: "0x39cb747453Be3416E659dAeA169540b6F000c885",
};
// -- unique: SentinelOracle (hardcoded proxy, verified on-chain) + syncCash() markets --
const ETH_SENTINEL_ORACLE = "0x444C53E194B40c272fAd683210e2cB1c16Ab132e";
const ETH_SYNC_CASH_MARKETS = [
  "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0",
  "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8",
  "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468",
  "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b",
  "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe",
  "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
  "0x256AdDBe0a387c98f487e44b85c29eb983413c5e",
  "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91",
  "0x2d499800239C4CD3012473Cb1EAE33562F0A6933",
  "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
  "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2",
  "0x475d0C68a8CD275c15D1F01F4f291804E445F677",
  "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB",
  "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95",
  "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764",
  "0x5e35C312862d53FD566737892aDCf010cb4928F7",
  "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B",
  "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
  "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C",
  "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
  "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
  "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
  "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
  "0xCca202a95E8096315E3F19E46e19E1b326634889",
  "0xDB6C345f864883a8F4cae87852Ac342589E76D1B",
  "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e",
  "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6",
  "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9",
  "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E",
  "0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3",
  "0xa836ce315b7A6Bb19397Ee996551659B1D92298e",
  "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A",
  "0xb4933AF59868986316Ed37fa865C829Eba2df0C7",
  "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0",
  "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
  "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2",
  "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657",
  "0xf87c0a64dc3a8622D6c63265FA29137788163879",
];

// ===================================================================================================
// arbitrumone
// ===================================================================================================
// -- common --
const ARB_ACM = NETWORK_ADDRESSES.arbitrumone.ACCESS_CONTROL_MANAGER;
const ARB_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";
const ARB_OMNICHAIN_EXECUTOR_OWNER = "0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD";
const ARB_REDUNDANT: Record<string, string> = {
  EBrake: "0xFc4CE7Ca9BB5119705Cfb84d6e4476e8a4032b26",
  Prime: "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49",
  PrimeLiquidityProvider: "0x86bf21dB200f29F21253080942Be8af61046Ec29",
  VenusERC4626Factory: "0xC1422B928cb6FC9BA52880892078578a93aa5Cc7",
};
// -- unique --
const ARB_SENTINEL_ORACLE = "0x3563CAbc541a0432C66A64942ffB4070a9726226";
const ARB_SYNC_CASH_MARKETS = [
  "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88",
  "0x39D6d13Ea59548637104E40e729E4aABE27FE106",
  "0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF",
  "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
  "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
  "0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC",
  "0x9df6B5132135f14719696bBAe3C54BAb272fDb16",
  "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
  "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
  "0xaDa57840B372D4c28623E87FC175dE8490792811",
];

// ===================================================================================================
// basemainnet
// ===================================================================================================
// -- common --
const BASE_ACM = NETWORK_ADDRESSES.basemainnet.ACCESS_CONTROL_MANAGER;
const BASE_XVS_BRIDGE_ADMIN = "0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e";
const BASE_OMNICHAIN_EXECUTOR_OWNER = "0x8BA591f72a90fb379b9a82087b190d51b226F0a9";
const BASE_REDUNDANT: Record<string, string> = {
  EBrake: "0x062C68Af7B9Fb059DCB7FA4B6b92E633350fb7c2",
  Prime: "0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30",
  PrimeLiquidityProvider: "0xcB293EB385dEFF2CdeDa4E7060974BB90ee0B208",
  VenusERC4626Factory: "0x1A430825B31DdA074751D6731Ce7Dca38D012D13",
};
// -- unique --
const BASE_SENTINEL_ORACLE = "0xCdD6D79Fd313C21967CED04C1b8bE70BDc27574D";
const BASE_SYNC_CASH_MARKETS = [
  "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5",
  "0x3cb752d175740043Ec463673094e06ACDa2F9a2e",
  "0x75201D81B3B0b9D17b179118837Be37f64fc4930",
  "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72",
  "0xEB8A79bD44cF4500943bf94a2b4434c95C008599",
];

// ===================================================================================================
// zksyncmainnet
// ===================================================================================================
// -- common --
const ZK_ACM = NETWORK_ADDRESSES.zksyncmainnet.ACCESS_CONTROL_MANAGER;
const ZK_XVS_BRIDGE_ADMIN = "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902";
const ZK_OMNICHAIN_EXECUTOR_OWNER = "0xdfaed3E5d9707629Ed5c225b4fB980c064286771";
const ZK_REDUNDANT: Record<string, string> = {
  Prime: "0xdFe62Dcba3Ce0A827439390d7d45Af8baE599978",
  PrimeLiquidityProvider: "0x0EDE6d7fB474614C5D3d5a16581628bb96CB5dff",
  VenusERC4626Factory: "0xDC59Dd76Dd7A64d743C764a9aa8C96Ff2Ea8BAc3",
};
// -- unique (no SentinelOracle on this chain) --
const ZK_SYNC_CASH_MARKETS = [
  "0x03CAd66259f7F34EE075f8B62D133563D249eDa4",
  "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c",
  "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
  "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
  "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
  "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
  "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a",
  "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
  "0xCEb7Da150d16aCE58F090754feF2775C23C8b631",
];

// ===================================================================================================
// opmainnet
// ===================================================================================================
// -- common (ACM not in networkAddresses — hardcoded, verified on-chain) --
const OP_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
const OP_XVS_BRIDGE_ADMIN = "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7";
const OP_OMNICHAIN_EXECUTOR_OWNER = "0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3";
const OP_REDUNDANT: Record<string, string> = {
  Prime: "0xE76d2173546Be97Fa6E18358027BdE9742a649f7",
  PrimeLiquidityProvider: "0x6412f6cd58D0182aE150b90B5A99e285b91C1a12",
  VenusERC4626Factory: "0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F",
};
// -- unique (no SentinelOracle on this chain) --
const OP_SYNC_CASH_MARKETS = [
  "0x1C9406ee95B7af55F005996947b19F91B6D55b15",
  "0x37ac9731B0B02df54975cd0c7240e0977a051721",
  "0x66d5AE25731Ce99D46770745385e662C8e0B4025",
  "0x6b846E3418455804C1920fA4CC7a31A51C659A2D",
  "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46",
];

// ===================================================================================================
// unichainmainnet
// ===================================================================================================
// -- common (ACM not in networkAddresses — hardcoded, verified on-chain) --
const UNI_ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
const UNI_XVS_BRIDGE_ADMIN = "0x2EAaa880f97C9B63d37b39b0b316022d93d43604";
const UNI_OMNICHAIN_EXECUTOR_OWNER = "0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd";
const UNI_REDUNDANT: Record<string, string> = {
  Prime: "0x600aFf613d40D87C8Fe90Cb2e78e8e6667c0C872",
  PrimeLiquidityProvider: "0x045a45603E1b073F444fe3Be7d5C7e0a5035afB7",
  VenusERC4626Factory: "0x102fEb723C25c67dbdfDccCa3B1c1a6e1a662D2f",
};
// -- unique (no SentinelOracle on this chain) --
const UNI_SYNC_CASH_MARKETS = [
  "0x0170398083eb0D0387709523baFCA6426146C218",
  "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2",
  "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5",
  "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95",
  "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD",
  "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB",
  "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374",
];

// ===================================================================================================
// opbnbmainnet
// ===================================================================================================
// -- common (ACM not in networkAddresses — hardcoded, verified on-chain) --
const OPBNB_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const OPBNB_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
const OPBNB_OMNICHAIN_EXECUTOR_OWNER = "0xf7e4c81Cf4A03d52472a4d00c3d9Ef35aF127E45";
const OPBNB_REDUNDANT: Record<string, string> = {
  VenusERC4626Factory: "0x89A5Ce0A6db7e66E53F148B50D879b700dEB81C8",
};
// -- unique (no SentinelOracle on this chain) --
const OPBNB_SYNC_CASH_MARKETS = [
  "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917",
  "0x509e81eF638D489936FA85BC58F52Df01190d26C",
  "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672",
  "0xED827b80Bd838192EA95002C01B5c6dA8354219a",
  "0xb7a01Ba126830692238521a1aA7E7A7509410b8e",
];

// ===================================================================================================
// Reassembled per-chain records — indexed by chain key by consumers. Edit the per-chain blocks above,
// not these.
// ===================================================================================================
export const REMOTE_ACM: Record<RemoteChain, string> = {
  ethereum: ETH_ACM,
  arbitrumone: ARB_ACM,
  basemainnet: BASE_ACM,
  zksyncmainnet: ZK_ACM,
  opmainnet: OP_ACM,
  unichainmainnet: UNI_ACM,
  opbnbmainnet: OPBNB_ACM,
};

export const XVS_BRIDGE_ADMIN: Record<RemoteChain, string> = {
  ethereum: ETH_XVS_BRIDGE_ADMIN,
  arbitrumone: ARB_XVS_BRIDGE_ADMIN,
  basemainnet: BASE_XVS_BRIDGE_ADMIN,
  zksyncmainnet: ZK_XVS_BRIDGE_ADMIN,
  opmainnet: OP_XVS_BRIDGE_ADMIN,
  unichainmainnet: UNI_XVS_BRIDGE_ADMIN,
  opbnbmainnet: OPBNB_XVS_BRIDGE_ADMIN,
};

export const OMNICHAIN_EXECUTOR_OWNER: Record<RemoteChain, string> = {
  ethereum: ETH_OMNICHAIN_EXECUTOR_OWNER,
  arbitrumone: ARB_OMNICHAIN_EXECUTOR_OWNER,
  basemainnet: BASE_OMNICHAIN_EXECUTOR_OWNER,
  zksyncmainnet: ZK_OMNICHAIN_EXECUTOR_OWNER,
  opmainnet: OP_OMNICHAIN_EXECUTOR_OWNER,
  unichainmainnet: UNI_OMNICHAIN_EXECUTOR_OWNER,
  opbnbmainnet: OPBNB_OMNICHAIN_EXECUTOR_OWNER,
};

export const SENTINEL_ORACLE: Partial<Record<RemoteChain, string>> = {
  ethereum: ETH_SENTINEL_ORACLE,
  arbitrumone: ARB_SENTINEL_ORACLE,
  basemainnet: BASE_SENTINEL_ORACLE,
};

export const SYNC_CASH_MARKETS: Record<RemoteChain, string[]> = {
  ethereum: ETH_SYNC_CASH_MARKETS,
  arbitrumone: ARB_SYNC_CASH_MARKETS,
  basemainnet: BASE_SYNC_CASH_MARKETS,
  zksyncmainnet: ZK_SYNC_CASH_MARKETS,
  opmainnet: OP_SYNC_CASH_MARKETS,
  unichainmainnet: UNI_SYNC_CASH_MARKETS,
  opbnbmainnet: OPBNB_SYNC_CASH_MARKETS,
};

export const REDUNDANT_CONTRACTS: Record<RedundantChain, Record<string, string>> = {
  bscmainnet: BNB_REDUNDANT,
  ethereum: ETH_REDUNDANT,
  arbitrumone: ARB_REDUNDANT,
  basemainnet: BASE_REDUNDANT,
  opmainnet: OP_REDUNDANT,
  unichainmainnet: UNI_REDUNDANT,
  zksyncmainnet: ZK_REDUNDANT,
  opbnbmainnet: OPBNB_REDUNDANT,
};
