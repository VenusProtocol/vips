import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { U, USDC, USDT } from "../../vip-671/addresses/bscmainnet";

// VIP-672 address book. Re-exports VIP-671's, so VIP-672 and VIP-673 each import one module.
export * from "../../vip-671/addresses/bscmainnet";

// ===================================================================================================
// VIP-672: Liquidity Hub infrastructure. Already on chain, read on 2026-10-14 (block ~127,532,000).
// ===================================================================================================

/// The one beacon behind all three Hubs, owned by the Normal Timelock. `upgradeTo` is `onlyOwner`, so it needs no
/// ACM grant, and it moves every Hub at once.
export const HUB_BEACON = "0x0f20e1004962e2DF16c16FC15460Dc6480626321";

/// The Hub implementation live today. Its runtime bytecode matches venus-liquidity-hub `main`'s `Hub.sol`.
export const HUB_LIVE_IMPL = "0x44BCabAF2e63A7B883EDeA6A721d47b4bC081d02";

export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";

/// The eleven live yield groups. FRVSource_USDC holds no resource, so the adapter swap skips it, but it is
/// registered on Hub_USDC and in its withdraw queue.
export const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const CORE_SOURCE_U = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
export const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const FLUX_SOURCE_U = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";
export const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";
export const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";
export const FRV_SOURCE_U = "0x30908eddB9E94add7AC9944a0adda66d80B89143";
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";
export const CENTRIFUGE_SOURCE_USDC = "0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c";

/// The adapters every live resource points at today.
export const ADAPTER_CORE_V1_LIVE = "0x4E514a0C7aB9d140eE204dfA0017574270D92944";
export const ADAPTER_FLUX_LIVE = "0xA81bDf813A428053E764C34Bc679b3E4d0807be3";
export const ADAPTER_FRV_LIVE = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902";
export const ADAPTER_CENTRIFUGE_LIVE = "0x680cE4422264ecDAd3590cB50FE254D4c153f427";

/// Their replacements, deployed on 2026-09-22 by `deploy/11_DeployAdapters` (venus-liquidity-hub#20). Runtime
/// bytecode matches venus-liquidity-hub#22 head, with metadata and immutables (the adapter's own address, and
/// the Flux resolver below) masked.
export const ADAPTER_CORE_V1 = "0xa061cC2F62BDa2D6bA53Fb98847aD9822DA085dd";
export const ADAPTER_FLUX = "0x9a1a7F6aebA4a1A3e85Ae1Dba90a7A2A52803404";
export const ADAPTER_FRV = "0x1824caA965Ac05ae5C9C2819e045337e2cF5657c";
export const ADAPTER_CENTRIFUGE = "0xaa9D52758890997D91950E595886FF9CDEca81ae";

/// `AdapterFlux`'s only constructor argument. The live and the new Flux adapter both read it back.
export const FLUID_LENDING_RESOLVER = "0x48D32f49aFeAEC7AE66ad7B9264f446fc11a1569";

export type AdapterSwap = {
  name: string;
  yieldGroup: string;
  resource: string;
  liveAdapter: string;
  newAdapter: string;
};

/// Every resource registered on every yield group of the three Hubs, with its live adapter. Each swap was dry-run
/// from the Normal Timelock; the simulation re-reads the full list.
export const ADAPTER_SWAPS: AdapterSwap[] = [
  {
    name: "CoreSource_USDT: vUSDT",
    yieldGroup: CORE_SOURCE_USDT,
    resource: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "CoreSource_USDC: vUSDC",
    yieldGroup: CORE_SOURCE_USDC,
    resource: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "CoreSource_U: vU",
    yieldGroup: CORE_SOURCE_U,
    resource: "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "FluxSource_USDT: fUSDT",
    yieldGroup: FLUX_SOURCE_USDT,
    resource: "0xA5b8FCa32E5252B0B58EAbf1A8c79d958F8EE6A2",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FluxSource_USDC: fUSDC",
    yieldGroup: FLUX_SOURCE_USDC,
    resource: "0xfE60462E93cee34319F48Cfc6AcFbc13c2882Df9",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FluxSource_U: fU",
    yieldGroup: FLUX_SOURCE_U,
    resource: "0x007df53Cda786450Cf8145a73B2748B241a0069c",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FRVSource_USDT: FRV-sv-17AUG2026-30",
    yieldGroup: FRV_SOURCE_USDT,
    resource: "0x086fd7972510dF9d9cFdc4efB8677fc72d290103",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "FRVSource_U: FRV-ast-13AUG2026-30",
    yieldGroup: FRV_SOURCE_U,
    resource: "0x41179fc6ff878b7795B900888E0B61fd8029bceA",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "FRVSource_U: FRV-hg-05OCT2026-30",
    yieldGroup: FRV_SOURCE_U,
    resource: "0xfE419E150d63ff288b9802533f6Fe2f886DB6FED",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "CentrifugeSource_USDT: Janus Henderson Treasury Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDT,
    resource: "0x6e6B8498415083a4386BE83DD59Edd4366402FFa",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDT: Janus Henderson AAA CLO Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDT,
    resource: "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDC: Janus Henderson Treasury Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDC,
    resource: "0x5aa84705a2CB2054ed303565336F188e6bfFbAF5",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDC: Janus Henderson AAA CLO Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDC,
    resource: "0x9effaa5614c689fA12892379e097b3ACaD239961",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
];

// ---------------------------------------------------------------------------------------------------
// VIP-672's new contracts, deployed by venus-liquidity-hub `deploy/10` and `deploy/12` to `deploy/14` from #39, which
// carries #20, #22, #29 and #37.
// ---------------------------------------------------------------------------------------------------

/// The new Hub implementation (`12_DeployHubImpl`). Same storage layout as the live implementation (`forge inspect`
/// against `main`), so the upgrade needs no reinitializer. It links the external `HubAdminLib` at
/// 0x607A8F3bbbf543F93e4e9a31D1000F2bca0058Ae, deployed in the same run.
export const HUB_IMPL = "0xb94925bF8Cc70d0F00226fA1f07d895Cb5Fbef4f";

/// The Spoke family beacon (`13_DeploySpoke`). Plain `Ownable`; the script transferred it to `governance` from
/// `deploy/config/bscmainnet.json`, which is the Normal Timelock.
export const SPOKE_BEACON = "0x652AAa1CD21f47a92D04680C1d9Bf99cC1Fb8975";

/// The generic `YieldGroup` implementation behind SPOKE_BEACON (`13_DeploySpoke`, recorded as `YieldGroupSpokeImpl`).
export const SPOKE_SOURCE_IMPL = "0xAF3055b3b88011Db4de7e910d730Ad6F412d7b39";

/// One Spoke source per Hub (`14_DeploySpokeSource`), a BeaconProxy on SPOKE_BEACON initialized with its Hub, that
/// Hub's asset, `blocksPerYear` 0 and the ACM. No owner, and no setter for its Hub or its ACM.
export const SPOKE_SOURCE_USDT = "0x3cC1eDE91419dC7EC199a06704EC8ECAb665a684";
export const SPOKE_SOURCE_USDC = "0x4cd4aB2F88E39D3F3e481bb2555EcdF00266f717";
export const SPOKE_SOURCE_U = "0xcA3f9AFD7C4c1022E4A37a12671Ef57B8A7bfc51";

/// Reference only (`10_DeployHubLens`); nothing in VIP-672 uses it. After the upgrade, Hub `maxDeposit` and `maxMint`
/// return `type(uint256).max` and `HubLens` reports the real capacity.
export const HUB_LENS = "0xE5d8A002A794CcDba248ba774a359eF2B9E4Ba8B";

export type HubStack = {
  name: string;
  hub: string;
  asset: string;
  spokeSource: string;
  /// Read on chain. Holds every registered group.
  withdrawQueueBefore: string[];
  /// Read on chain. VIP-672 does not change it.
  depositQueue: string[];
  /// The Spoke source's caps, set by VIP-672's `addYieldGroup`. The effective cap is the lower of the absolute cap and
  /// the percentage of the Hub's TVL.
  spokeAbsoluteCap: BigNumber;
  spokePercentageCapBps: number;
};

/// Spoke source caps from the risk listing sheet: 50% of the Hub's TVL, and an absolute cap of half the Core market's
/// supply cap (600M USDT, 180M USDC, 60M U, read on 2026-10-14).
///
/// Registered with these final values, so no later raise is needed. Nothing reaches a source before VIP-673: the Hub
/// deposits only through its deposit queue, which VIP-672 leaves alone, a source with no resource refunds any deposit,
/// and a reallocation into it reverts `ResourceNotRegistered`.
const SPOKE_PERCENTAGE_CAP_BPS = 5000;

/// The three Hubs. VIP-672 appends each Spoke source to the end of its Hub's withdraw queue, the order the VIP
/// document sets (§3.4).
export const HUB_STACKS: HubStack[] = [
  {
    name: "Hub_USDT",
    hub: HUB_USDT,
    asset: USDT,
    spokeSource: SPOKE_SOURCE_USDT,
    withdrawQueueBefore: [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT],
    depositQueue: [CORE_SOURCE_USDT, FLUX_SOURCE_USDT],
    spokeAbsoluteCap: parseUnits("300000000", 18),
    spokePercentageCapBps: SPOKE_PERCENTAGE_CAP_BPS,
  },
  {
    name: "Hub_USDC",
    hub: HUB_USDC,
    asset: USDC,
    spokeSource: SPOKE_SOURCE_USDC,
    withdrawQueueBefore: [FLUX_SOURCE_USDC, CORE_SOURCE_USDC, FRV_SOURCE_USDC, CENTRIFUGE_SOURCE_USDC],
    depositQueue: [CORE_SOURCE_USDC, FLUX_SOURCE_USDC],
    spokeAbsoluteCap: parseUnits("90000000", 18),
    spokePercentageCapBps: SPOKE_PERCENTAGE_CAP_BPS,
  },
  {
    name: "Hub_U",
    hub: HUB_U,
    asset: U,
    spokeSource: SPOKE_SOURCE_U,
    withdrawQueueBefore: [FLUX_SOURCE_U, CORE_SOURCE_U, FRV_SOURCE_U],
    depositQueue: [CORE_SOURCE_U, FLUX_SOURCE_U],
    spokeAbsoluteCap: parseUnits("30000000", 18),
    spokePercentageCapBps: SPOKE_PERCENTAGE_CAP_BPS,
  },
];

// ---------------------------------------------------------------------------------------------------
// VIP-672: ACM batching through the AuxiliaryCommandsAggregator (VIP-628). See ../bscmainnet.ts for why.
//
// Read on 2026-10-14: the Normal Timelock owns the aggregator, holds `executeBatch(uint256)` on it and is an
// authorized batcher. Of the Normal, Fast-track and Critical timelocks and the two guardians, only the Normal
// Timelock holds DEFAULT_ADMIN_ROLE on the ACM. The aggregator does not hold it.
// ---------------------------------------------------------------------------------------------------

export const AUX_COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

/// TODO(ops): the aggregator slot of the Spoke source grants batch. 5 is the next free slot on 2026-10-14
/// (`batchCount()`); any batch stored before ours moves it. Set it to the live `batchCount()` just before running
/// ../provisionAcmBatches.ts, which refuses to store on a mismatch.
export const SPOKE_SOURCE_GRANTS_BATCH_INDEX = 5;
