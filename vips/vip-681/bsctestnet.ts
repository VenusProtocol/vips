import { constants } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

export { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK };

// ────────────────────────────────────────────────────────────────
// Beacons and implementations
// ────────────────────────────────────────────────────────────────
export const CORE_BEACON = "0xbBEe25aE7d2Db035Afc327fb0096fC88FDfF3170";
export const FLUX_BEACON = "0x6b9CA74F82848668EA04D56E0A8396A816ba5330";
export const FRV_BEACON = "0x6196Ec22133610132563B03b6Fad5aa766A9C037";
export const SPOKE_BEACON = "0x58099BEaa6A00F493eF67fF953866DDA4a502389";

export const OLD_CORE_IMPLEMENTATION = "0x96b839765b7bc062e354f57c8F9f7Be328C4fb63";
export const OLD_FLUX_IMPLEMENTATION = "0xEe52fb9ec5bcD6868a3D7f2FBb3e71e9D6Fc97dd";
export const OLD_FRV_IMPLEMENTATION = "0x4fC5cFafCa279777DfF65f7D7e19205d3785304C";
export const OLD_SPOKE_IMPLEMENTATION = "0x8FE673B36eBEe52A39B76e91A3cA207C4bA0e462";

// One YieldGroup implementation serves the Core, Flux and Spoke beacons
export const NEW_YIELD_GROUP_IMPLEMENTATION = "0x1c38e8c91c335Ac2B052E882eB8F7c069E63Da4d";
export const NEW_YIELD_GROUP_FRV_IMPLEMENTATION = "0x40bBb4d943BeEd8Dc9646c570c9C91fac9dd2457";

// ────────────────────────────────────────────────────────────────
// Yield groups on Hub_USDT that track receipts
// ────────────────────────────────────────────────────────────────
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const SPOKE_SOURCE_USDT = "0xb9Bf8232474aF0A18BbA0CbCc3bA10efD51542e2";
export const TRACKING_GROUPS = [CORE_SOURCE_USDT, FLUX_SOURCE_USDT, FRV_SOURCE_USDT, SPOKE_SOURCE_USDT];

// ────────────────────────────────────────────────────────────────
// Adapters. The new ones add receiptValue; the Core one also quotes cash net of reserves
// ────────────────────────────────────────────────────────────────
export const ADAPTERS = {
  CORE: { old: "0x07c80ed1F928913ab68E1fABB2fe0439CdC99F88", new: "0x32DfFD70B8E91C20B708d03C8051ad59F2C6391D" },
  FLUX: { old: "0x51d8cAdc16Df3F8Cd0D1B536e943FbDcE77AC523", new: "0xC17f2F74057a6beeeb32F3D1F6c8C6A7067e86f0" },
  FRV: { old: "0xcdd9cf27C388dAc9e89De257505aff9290183537", new: "0x790960cBC0B5A88765cFE89C5bD604163f4E2D9C" },
  SPOKE: { old: "0x439034668f201B9f2D45286b4518e6DB122B5e17", new: "0xbeAE38F78944F62c00943Fc7e335E0D59c359E98" },
};

// ────────────────────────────────────────────────────────────────
// Every resource registered on the four groups
// ────────────────────────────────────────────────────────────────
export const CORE_VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const FLUX_FUSDT = "0x52217232e12A1c906aB8DEf58532a3618970D025";
export const SPOKE_VUSDT = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a";
export const FRV_VAULTS = [
  "0x00f275BBc37Ec884Ea057F46463FfB669cd5F69d",
  "0x79B7c1b80ab09CbfF5a8350505AbCd3eb186b5B0",
  "0xF65a258bC1A01c3E19e46b7e6069082Ec4E49d82",
  "0xb64484B440B7332FdC9741229fB63c73E67E1aAF",
  "0xCA4dB890025a1940Ba9B65dbB6cd966c8b78EBe6",
  "0x39296eA9A38A35678f660390eA29a5657068b3aD",
  "0xc0c322aF01D85B1dF050fF4d3975a1B744CE722A",
  "0xf1786b41E755395b10870630542Af4e6b4F8789f",
];

export const RESOURCES: { group: string; resource: string; adapter: keyof typeof ADAPTERS }[] = [
  { group: CORE_SOURCE_USDT, resource: CORE_VUSDT, adapter: "CORE" },
  { group: FLUX_SOURCE_USDT, resource: FLUX_FUSDT, adapter: "FLUX" },
  ...FRV_VAULTS.map(resource => ({ group: FRV_SOURCE_USDT, resource, adapter: "FRV" as const })),
  { group: SPOKE_SOURCE_USDT, resource: SPOKE_VUSDT, adapter: "SPOKE" },
];

export const SYNC_RECEIPT = "syncReceipt(address,uint256)";
export const SYNC_WHOLE_WALLET = constants.MaxUint256; // no cap: every tracked count starts at 0 after the upgrade

export const vip681 = () => {
  const meta = {
    version: "v2",
    title: "VIP-681 [BNB Chain Testnet] Liquidity Hub receipt tracking upgrade",
    description: `#### Summary

Upgrades the Core, Flux, FRV and Spoke YieldGroups of the Liquidity Hub (USDT) on BNB Chain Testnet so that each one values only the receipt tokens it minted through its own deposits. Receipt tokens sent to a YieldGroup directly no longer change the Hub's share price until governance adds them with \`syncReceipt\`. The upgrade includes the HashDit audit fixes.

#### Actions

1. Grant \`syncReceipt(address,uint256)\` to the Normal Timelock on the four YieldGroups, and to the Guardian on every contract, like its other testnet Hub roles.
2. Upgrade the Core, Flux and Spoke beacons to the YieldGroup implementation [${NEW_YIELD_GROUP_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_YIELD_GROUP_IMPLEMENTATION}), and the FRV beacon to the YieldGroupFRV implementation [${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}).
3. Point all 11 resources at the new adapters, which add \`receiptValue\`. The Core adapter also quotes withdrawable cash net of the market's reserves.
4. Sync each resource's tracked receipt count to the receipts the YieldGroup holds, with no cap, so the Hub's value stays the same.

#### Notes

- Testnet only. Mainnet runs the same steps on the U, USDC and USDT Hubs.
- All four steps must run in one proposal. The new implementation prices positions through \`receiptValue\`, which the old adapters do not have, and every tracked count reads 0 until step 4 runs.
- The Centrifuge YieldGroup is not touched, because it does not track receipts.

#### References

- [Receipt tracking](https://github.com/VenusProtocol/venus-liquidity-hub/pull/40) and [HashDit fixes](https://github.com/VenusProtocol/venus-liquidity-hub/pull/43)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. syncReceipt permission
      // ────────────────────────────────────────────────────────────────
      ...TRACKING_GROUPS.map(group => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [group, SYNC_RECEIPT, NORMAL_TIMELOCK],
      })),
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [constants.AddressZero, SYNC_RECEIPT, GUARDIAN], // wildcard, as the Guardian's other Hub roles are
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
        signature: "updateResourceAdapter(address,address)",
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip681;
