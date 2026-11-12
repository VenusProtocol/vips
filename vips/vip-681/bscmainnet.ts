import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, CHAINLINK_ORACLE, NORMAL_TIMELOCK, VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

// ────────────────────────────────────────────────────────────────
// YieldGroup beacons, one per family, and their implementations
// Each beacon serves its family on the U, USDC and USDT Hubs
// ────────────────────────────────────────────────────────────────
export const CORE_BEACON = "0x195a0F1BCF73C3Beb609a1271E8E08b8E4c098C6";
export const FLUX_BEACON = "0x9bb6a3Ac5955fA8dc236560CA9D51483d1d79f15";
export const FRV_BEACON = "0x8A5EceDD726246682402430b9B24c19bF61B7f1d";
export const SPOKE_BEACON = "0x652AAa1CD21f47a92D04680C1d9Bf99cC1Fb8975";

export const OLD_CORE_IMPLEMENTATION = "0x3BccED778CAaf97AE8ff8Bedc16d2165aA15771b";
export const OLD_FLUX_IMPLEMENTATION = "0xFD49a719E0bF7f588F77bBEdf10dd8E843774499";
export const OLD_FRV_IMPLEMENTATION = "0x72D115b1Be69a2065fED0B0574F95B3E46BD4502";
export const OLD_SPOKE_IMPLEMENTATION = "0xAF3055b3b88011Db4de7e910d730Ad6F412d7b39";

// One YieldGroup implementation serves the Core, Flux and Spoke beacons
export const NEW_YIELD_GROUP_IMPLEMENTATION = "0xedB1c751Eb03274e9D15D0609B4593CC113fB09F";
export const NEW_YIELD_GROUP_FRV_IMPLEMENTATION = "0xcffcDBCfEDBf33FB22bdd5FadB3916b871711A06";

// ────────────────────────────────────────────────────────────────
// Adapters. The new ones add receiptValue; the Core one also quotes cash net of reserves
// ────────────────────────────────────────────────────────────────
export const ADAPTERS = {
  CORE: { old: "0xa061cC2F62BDa2D6bA53Fb98847aD9822DA085dd", new: "0x0f62927d18Fd35712622C2c6C3F730EB8a18b71B" },
  FLUX: { old: "0x9a1a7F6aebA4a1A3e85Ae1Dba90a7A2A52803404", new: "0x4Afb747ce8dDef689d5484FFdfB69Ac8bC7cAc8B" },
  FRV: { old: "0x1824caA965Ac05ae5C9C2819e045337e2cF5657c", new: "0x40fDc0fef94D607EE4341230afb09bcDB0B949E2" },
  SPOKE: { old: "0x231915FfE3e3A6Be09B0E5c73EFA2F1a4FF8Aa69", new: "0xD08596E58325724C824100bA87f2470493Fe342d" },
};

// ────────────────────────────────────────────────────────────────
// Every Hub in the HubRegistry, and the tracking YieldGroups the beacons upgrade (Centrifuge is not one)
// ────────────────────────────────────────────────────────────────
export const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";

export const CORE_SOURCE_U = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const FLUX_SOURCE_U = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";
export const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const FRV_SOURCE_U = "0x30908eddB9E94add7AC9944a0adda66d80B89143";
export const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716"; // no resources registered
export const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";
export const SPOKE_SOURCE_U = "0xcA3f9AFD7C4c1022E4A37a12671Ef57B8A7bfc51";
export const SPOKE_SOURCE_USDC = "0x4cd4aB2F88E39D3F3e481bb2555EcdF00266f717";
export const SPOKE_SOURCE_USDT = "0x3cC1eDE91419dC7EC199a06704EC8ECAb665a684";

export const TRACKING_GROUPS = [
  CORE_SOURCE_U,
  CORE_SOURCE_USDC,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_U,
  FLUX_SOURCE_USDC,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_U,
  FRV_SOURCE_USDC,
  FRV_SOURCE_USDT,
  SPOKE_SOURCE_U,
  SPOKE_SOURCE_USDC,
  SPOKE_SOURCE_USDT,
];

// ────────────────────────────────────────────────────────────────
// Every resource registered on the twelve groups
// ────────────────────────────────────────────────────────────────
export const RESOURCES: { group: string; resource: string; adapter: keyof typeof ADAPTERS }[] = [
  { group: CORE_SOURCE_U, resource: "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E", adapter: "CORE" }, // vU
  { group: CORE_SOURCE_USDC, resource: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", adapter: "CORE" }, // vUSDC
  { group: CORE_SOURCE_USDT, resource: "0xfD5840Cd36d94D7229439859C0112a4185BC0255", adapter: "CORE" }, // vUSDT
  { group: FLUX_SOURCE_U, resource: "0x007df53Cda786450Cf8145a73B2748B241a0069c", adapter: "FLUX" }, // fU
  { group: FLUX_SOURCE_USDC, resource: "0xfE60462E93cee34319F48Cfc6AcFbc13c2882Df9", adapter: "FLUX" }, // fUSDC
  { group: FLUX_SOURCE_USDT, resource: "0xA5b8FCa32E5252B0B58EAbf1A8c79d958F8EE6A2", adapter: "FLUX" }, // fUSDT
  { group: FRV_SOURCE_U, resource: "0x41179fc6ff878b7795B900888E0B61fd8029bceA", adapter: "FRV" }, // FRV-ast-13AUG2026-30
  { group: FRV_SOURCE_U, resource: "0xfE419E150d63ff288b9802533f6Fe2f886DB6FED", adapter: "FRV" }, // FRV-hg-05OCT2026-30
  { group: FRV_SOURCE_U, resource: "0x19209BfF412472c203892Edf0C9F0320498d9bD7", adapter: "FRV" }, // FRV-og-29OCT2026-30
  { group: FRV_SOURCE_USDT, resource: "0x086fd7972510dF9d9cFdc4efB8677fc72d290103", adapter: "FRV" }, // FRV-sv-17AUG2026-30
  { group: SPOKE_SOURCE_U, resource: "0x713bBaA44Dc99e691F1F9fE8086FC328E94B6f27", adapter: "SPOKE" }, // vU_bStockIndex
  { group: SPOKE_SOURCE_U, resource: "0x24Ee5A3F631f9c2FAf8a730d43F059D3eA9566AD", adapter: "SPOKE" }, // vU_bStockMainstream
  { group: SPOKE_SOURCE_U, resource: "0x60d7BFd15B2414e9a29DEB04b84F1AD8c9868E44", adapter: "SPOKE" }, // vU_BPNLoan
  { group: SPOKE_SOURCE_USDC, resource: "0x6adb5e462ac6eA880246F24E3C47D23f70FCCbF6", adapter: "SPOKE" }, // vUSDC_bStockIndex
  { group: SPOKE_SOURCE_USDC, resource: "0xD7608E9dFe6CB4b527d41abF40d0f46D917c9EeA", adapter: "SPOKE" }, // vUSDC_bStockMainstream
  { group: SPOKE_SOURCE_USDC, resource: "0xd43e18D5568E544aA98b2EB1f3039f4a24267B7c", adapter: "SPOKE" }, // vUSDC_BPNLoan
  { group: SPOKE_SOURCE_USDT, resource: "0xEA0096142fBB56AAc0F594ED1D4de3E4De638f22", adapter: "SPOKE" }, // vUSDT_bStockIndex
  { group: SPOKE_SOURCE_USDT, resource: "0x2b12bC29044CE8f018Ae0aF5929450a8A6259Ed8", adapter: "SPOKE" }, // vUSDT_bStockMainstream
  { group: SPOKE_SOURCE_USDT, resource: "0x722997e2211a224Ac98Cc55D8C1C973D63623a0b", adapter: "SPOKE" }, // vUSDT_BPNLoan
];

// ────────────────────────────────────────────────────────────────
// PancakeSwapOracles still owned by their deployers, each with its chain's Normal Timelock as pending owner
// ────────────────────────────────────────────────────────────────
export const PANCAKESWAP_ORACLE_ETHEREUM = "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40";
export const PANCAKESWAP_ORACLE_ARBITRUMONE = "0x3Fd56a3Ad5aC85D1502988323386C68B2ed9366B";
export const PANCAKESWAP_ORACLE_BASEMAINNET = "0x0512FD9052b601436478c086D36e62E3F0EB29C1";

// ────────────────────────────────────────────────────────────────
// Allez Labs Q4 2026 payment, sourced from the Treasury's USDC Hub shares (vhUSDC)
// ────────────────────────────────────────────────────────────────
export const ALLEZ_LABS = "0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e"; // same recipient as VIP-594, VIP-612 and VIP-644
export const ALLEZ_LABS_USDC_AMOUNT = parseUnits("105000", 18); // USDC
// ~104,060 vhUSDC buys 105,000 USDC at the authoring blocks. The ~0.5% margin keeps the withdrawal from
// reverting if the share price dips before execution; whatever is left stays with the Normal Timelock
export const VHUSDC_WITHDRAW_AMOUNT = parseUnits("104600", 24); // vhUSDC has 24 decimals

// ────────────────────────────────────────────────────────────────
// FLOKI exit price set by VIP-679 on the ChainlinkOracle, removed here
// ────────────────────────────────────────────────────────────────
export const FLOKI = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E";
export const VFLOKI_GAMEFI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const FLOKI_PRICE_VIP_679 = parseUnits("0.00002228", 18); // the direct price this VIP clears

export const SYNC_RECEIPT = "syncReceipt(address,uint256)";
export const UPDATE_RESOURCE_ADAPTER = "updateResourceAdapter(address,address)";
export const SYNC_WHOLE_WALLET = constants.MaxUint256; // no cap: every tracked count starts at 0 after the upgrade

export const vip681 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-681 [BNB Chain, Ethereum, Arbitrum One, Base] Liquidity Hub receipt tracking upgrade, Allez Labs Q4 payment, FLOKI price removal and PancakeSwapOracle ownership",
    description: `#### Summary

If passed, this VIP upgrades the Core, Flux, FRV and Spoke YieldGroups of the U, USDC and USDT Liquidity Hubs so that each one values only the receipt tokens it minted through its own deposits. Receipt tokens sent to a YieldGroup directly will no longer change a Hub's share price, so nobody can raise it by sending over-priced receipt tokens in. Governance can still add such tokens with \`syncReceipt\`, capped at the amount it reviewed. The VIP also pays Allez Labs its Q4 2026 fee of 105,000 USDC from the Treasury's USDC Hub position, removes the fixed FLOKI price set by VIP-679, and has the Normal Timelocks on Ethereum, Arbitrum One and Base accept ownership of their PancakeSwapOracle.

#### Actions

1. Grant \`syncReceipt(address,uint256)\` to the Normal Timelock as a wildcard (contract address zero), like its other YieldGroup roles from VIP-673.
2. Upgrade the Core, Flux and Spoke beacons to the YieldGroup implementation [${NEW_YIELD_GROUP_IMPLEMENTATION}](https://bscscan.com/address/${NEW_YIELD_GROUP_IMPLEMENTATION}), and the FRV beacon to the YieldGroupFRV implementation [${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}](https://bscscan.com/address/${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}). Each beacon serves its family on all three Hubs, so this upgrades 12 YieldGroups. The new implementations add one storage mapping and leave the existing layout unchanged.
3. Point all 19 registered resources at the new adapters, which add \`receiptValue\`. The Core adapter also quotes withdrawable cash net of the market's reserves.
4. Sync each resource's tracked receipt count to the receipts its YieldGroup holds, with no cap. The current implementation already values the whole balance, so each Hub's value stays the same.
5. Pay Allez Labs 105,000 USDC for Q4 2026 (26 October 2026 to 25 January 2027), billed quarterly in advance at $35,000 a month, the same amount as Q2 ([VIP-612](https://app.venus.io/#/governance/proposal/612?chainId=56)) and Q3 ([VIP-644](https://app.venus.io/#/governance/proposal/644?chainId=56)). The Treasury holds only about 8,800 liquid USDC, so the USDC comes from its USDC Hub shares: the Treasury sends 104,600 vhUSDC ([${HUB_USDC}](https://bscscan.com/address/${HUB_USDC})) to the Normal Timelock, which withdraws exactly 105,000 USDC from the Hub to Allez Labs ([${ALLEZ_LABS}](https://bscscan.com/address/${ALLEZ_LABS})).
6. Remove the fixed FLOKI ([${FLOKI}](https://bscscan.com/address/${FLOKI})) price of $0.00002228 that [VIP-679](https://app.venus.io/#/governance/proposal/679?chainId=56) set on the ChainlinkOracle ([${CHAINLINK_ORACLE}](https://bscscan.com/address/${CHAINLINK_ORACLE})), by setting its direct price back to 0. The ChainlinkOracle has no FLOKI feed and the ResilientOracle has no pivot or fallback for FLOKI, so FLOKI has no price again, as before VIP-679.
7. Accept ownership of the PancakeSwapOracle on Ethereum ([${PANCAKESWAP_ORACLE_ETHEREUM}](https://etherscan.io/address/${PANCAKESWAP_ORACLE_ETHEREUM})), Arbitrum One ([${PANCAKESWAP_ORACLE_ARBITRUMONE}](https://arbiscan.io/address/${PANCAKESWAP_ORACLE_ARBITRUMONE})) and Base ([${PANCAKESWAP_ORACLE_BASEMAINNET}](https://basescan.org/address/${PANCAKESWAP_ORACLE_BASEMAINNET})). Each deployer handed it to its chain's Normal Timelock, but VIP-616, which accepted the other sentinel contracts on these chains, left it out, so the deployer wallets still own it. BNB Chain's PancakeSwapOracle was accepted in VIP-590.

#### Notes

- Steps 1 to 4 must run in this one proposal. The new implementation prices positions through \`receiptValue\`, which the current adapters do not have, so a YieldGroup left on a current adapter would make its Hub's \`totalAssets()\` revert. Every tracked count also reads 0 until step 4 runs.
- The Centrifuge YieldGroups are not touched, because they do not track receipts.
- The Guardian does not get \`syncReceipt\`, because a sync changes a Hub's share price.
- No market on Ethereum, Arbitrum One or Base prices through its PancakeSwapOracle today, so step 7 changes no price.
- Step 5 runs after the sync, when the USDC Hub prices correctly again. 104,600 vhUSDC is about 0.5% more than the payment needs, so a small dip in the share price cannot make it revert. The unused vhUSDC, worth roughly 570 USDC, stays with the Normal Timelock and can be returned to the Treasury in a later VIP.
- After step 6, the FLOKI exit window that VIP-679 opened on the GameFi pool closes. Suppliers in vFLOKI_GameFi ([${VFLOKI_GAMEFI}](https://bscscan.com/address/${VFLOKI_GAMEFI})) who use it as collateral can no longer redeem, and FLOKI token-converter pairs stop converting. The Core pool is not affected.
- The code has been audited by HashDit, and this deployment includes the fixes from that audit.

#### Deployed contracts

- YieldGroup implementation (Core, Flux and Spoke): [${NEW_YIELD_GROUP_IMPLEMENTATION}](https://bscscan.com/address/${NEW_YIELD_GROUP_IMPLEMENTATION})
- YieldGroupFRV implementation: [${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}](https://bscscan.com/address/${NEW_YIELD_GROUP_FRV_IMPLEMENTATION})
- AdapterCoreV1: [${ADAPTERS.CORE.new}](https://bscscan.com/address/${ADAPTERS.CORE.new})
- AdapterFlux: [${ADAPTERS.FLUX.new}](https://bscscan.com/address/${ADAPTERS.FLUX.new})
- AdapterFRV: [${ADAPTERS.FRV.new}](https://bscscan.com/address/${ADAPTERS.FRV.new})
- AdapterSpokeV1: [${ADAPTERS.SPOKE.new}](https://bscscan.com/address/${ADAPTERS.SPOKE.new})

#### References

- [Receipt tracking](https://github.com/VenusProtocol/venus-liquidity-hub/pull/40) and [HashDit fixes](https://github.com/VenusProtocol/venus-liquidity-hub/pull/43)
- [HashDit audit report](https://github.com/VenusProtocol/venus-liquidity-hub/blob/develop/audits/213_ReceiptTracking_Hashdit_20261106.pdf)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. syncReceipt permission
      // ────────────────────────────────────────────────────────────────
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [constants.AddressZero, SYNC_RECEIPT, NORMAL_TIMELOCK],
      },

      // ────────────────────────────────────────────────────────────────
      // 2. Beacon upgrades
      // ────────────────────────────────────────────────────────────────
      { target: CORE_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_IMPLEMENTATION] },
      { target: FLUX_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_IMPLEMENTATION] },
      { target: FRV_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_FRV_IMPLEMENTATION] },
      { target: SPOKE_BEACON, signature: "upgradeTo(address)", params: [NEW_YIELD_GROUP_IMPLEMENTATION] },

      // ────────────────────────────────────────────────────────────────
      // 3. New adapters
      // ────────────────────────────────────────────────────────────────
      ...RESOURCES.map(({ group, resource, adapter }) => ({
        target: group,
        signature: UPDATE_RESOURCE_ADAPTER,
        params: [resource, ADAPTERS[adapter].new],
      })),

      // ────────────────────────────────────────────────────────────────
      // 4. Tracked receipt counts
      // ────────────────────────────────────────────────────────────────
      ...RESOURCES.map(({ group, resource }) => ({
        target: group,
        signature: SYNC_RECEIPT,
        params: [resource, SYNC_WHOLE_WALLET],
      })),

      // ────────────────────────────────────────────────────────────────
      // 5. Allez Labs Q4 2026 payment, after the sync so the USDC Hub prices correctly again
      // ────────────────────────────────────────────────────────────────
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [HUB_USDC, VHUSDC_WITHDRAW_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: HUB_USDC,
        signature: "withdraw(uint256,address,address)",
        params: [ALLEZ_LABS_USDC_AMOUNT, ALLEZ_LABS, NORMAL_TIMELOCK],
      },

      // ────────────────────────────────────────────────────────────────
      // 6. FLOKI price removal: clears the VIP-679 direct price, leaving FLOKI with no price
      // ────────────────────────────────────────────────────────────────
      { target: CHAINLINK_ORACLE, signature: "setDirectPrice(address,uint256)", params: [FLOKI, 0] },

      // ────────────────────────────────────────────────────────────────
      // 7. Missing PancakeSwapOracle ownership calls on Ethereum, Arbitrum One and Base (left out of VIP-616)
      // ────────────────────────────────────────────────────────────────
      {
        target: PANCAKESWAP_ORACLE_ETHEREUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PANCAKESWAP_ORACLE_ARBITRUMONE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: PANCAKESWAP_ORACLE_BASEMAINNET,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip681;
