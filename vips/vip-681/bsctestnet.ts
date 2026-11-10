import { constants } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// ────────────────────────────────────────────────────────────────
// YieldGroup beacons, one per family, and their implementations
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
// Yield groups that track receipts, on the USDT and USDC Hubs only
// Covers just the Hubs mainnet runs (U, USDC, USDT; testnet has no U); other testnet asset Hubs are left out
// ────────────────────────────────────────────────────────────────
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const SPOKE_SOURCE_USDT = "0xb9Bf8232474aF0A18BbA0CbCc3bA10efD51542e2";

export const HUB_USDC = "0xCf11a9db610584ee9bD56a271306956d3B0b929F";
export const CORE_SOURCE_USDC = "0xB373788761b54258e69757D9A35715Be4e257CB7";
export const FRV_SOURCE_USDC = "0x67BB7ac021Fd37a226B7A99bA27EEE382f7c5E5b";

// ────────────────────────────────────────────────────────────────
// New adapters. They add receiptValue; the Core one also quotes cash net of reserves
// ────────────────────────────────────────────────────────────────
export const ADAPTER_CORE = "0x32DfFD70B8E91C20B708d03C8051ad59F2C6391D";
export const ADAPTER_FLUX = "0xC17f2F74057a6beeeb32F3D1F6c8C6A7067e86f0";
export const ADAPTER_FRV = "0x790960cBC0B5A88765cFE89C5bD604163f4E2D9C";
export const ADAPTER_SPOKE = "0xbeAE38F78944F62c00943Fc7e335E0D59c359E98";

// ────────────────────────────────────────────────────────────────
// Every resource registered on the six groups
// ────────────────────────────────────────────────────────────────
export const CORE_VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const FLUX_FUSDT = "0x52217232e12A1c906aB8DEf58532a3618970D025";
export const SPOKE_VUSDT = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a";
export const FRV_VAULTS_USDT = [
  "0x00f275BBc37Ec884Ea057F46463FfB669cd5F69d",
  "0x79B7c1b80ab09CbfF5a8350505AbCd3eb186b5B0",
  "0xF65a258bC1A01c3E19e46b7e6069082Ec4E49d82",
  "0xb64484B440B7332FdC9741229fB63c73E67E1aAF",
  "0xCA4dB890025a1940Ba9B65dbB6cd966c8b78EBe6",
  "0x39296eA9A38A35678f660390eA29a5657068b3aD",
  "0xc0c322aF01D85B1dF050fF4d3975a1B744CE722A",
  "0xf1786b41E755395b10870630542Af4e6b4F8789f",
];

export const CORE_VUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const FRV_VAULT_HT_USDC = "0x3c26A1Cf735Fe22c7B0D75997C5E8707F11E4a70"; // htUSDCFRV
export const FRV_VAULT_QA_USDC = "0xb4340266808bcfA85FcDa3382211ea6Df120D3c4"; // qaUSDCFRV

export const RESOURCES = [
  { group: CORE_SOURCE_USDT, resource: CORE_VUSDT, adapter: ADAPTER_CORE },
  { group: FLUX_SOURCE_USDT, resource: FLUX_FUSDT, adapter: ADAPTER_FLUX },
  ...FRV_VAULTS_USDT.map(resource => ({ group: FRV_SOURCE_USDT, resource, adapter: ADAPTER_FRV })),
  { group: SPOKE_SOURCE_USDT, resource: SPOKE_VUSDT, adapter: ADAPTER_SPOKE },
  { group: CORE_SOURCE_USDC, resource: CORE_VUSDC, adapter: ADAPTER_CORE },
  { group: FRV_SOURCE_USDC, resource: FRV_VAULT_HT_USDC, adapter: ADAPTER_FRV },
  { group: FRV_SOURCE_USDC, resource: FRV_VAULT_QA_USDC, adapter: ADAPTER_FRV },
];

export const SYNC_RECEIPT = "syncReceipt(address,uint256)";
export const UPDATE_RESOURCE_ADAPTER = "updateResourceAdapter(address,address)";
export const SYNC_WHOLE_WALLET = constants.MaxUint256; // no cap: every tracked count starts at 0 after the upgrade

export const vip681 = () => {
  const meta = {
    version: "v2",
    title: "VIP-681 [BNB Chain Testnet] Liquidity Hub receipt tracking upgrade",
    description: `#### Summary

Upgrades the YieldGroups of the USDT and USDC Liquidity Hubs on BNB Chain Testnet, the two testnet Hubs that also run on mainnet, so that each one values only the receipt tokens it minted through its own deposits. Receipt tokens sent to a YieldGroup directly no longer change the Hub's share price until governance adds them with \`syncReceipt\`. The upgrade includes the HashDit audit fixes.

#### Actions

1. Grant \`syncReceipt(address,uint256)\` to the Normal Timelock and the Guardian on every contract, like the Guardian's other testnet Hub roles. Grant \`updateResourceAdapter(address,address)\` to the Normal Timelock on the two USDC YieldGroups, which do not have it yet.
2. Upgrade the Core, Flux and Spoke beacons to the YieldGroup implementation [${NEW_YIELD_GROUP_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_YIELD_GROUP_IMPLEMENTATION}), and the FRV beacon to the YieldGroupFRV implementation [${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_YIELD_GROUP_FRV_IMPLEMENTATION}).
3. Point all 14 resources (11 on USDT, 3 on USDC) at the new adapters, which add \`receiptValue\`. The Core adapter also quotes withdrawable cash net of the market's reserves.
4. Sync each resource's tracked receipt count to the receipts the YieldGroup holds, with no cap, so each Hub's value stays the same.

#### Notes

- Testnet only. Mainnet runs the same steps on the U, USDC and USDT Hubs; testnet has no U Hub.
- All four steps must run in one proposal. The new implementation prices positions through \`receiptValue\`, which the old adapters do not have, and every tracked count reads 0 until step 4 runs.
- Only the Hubs that also run on mainnet, USDT and USDC, are migrated. The other testnet asset Hubs (BTCB, FDUSD, AAVE, TUSD, vhTUSD, LTC, DOGE, TRX, ADA, ETH, CAKE, WBNB, BUSD, SOL and SXP) are left out on purpose. They share these beacons, so their \`totalAssets\` reverts until their resources are pointed at the new adapters and synced, which the Guardian can do with its wildcard roles.
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
      // 1. Permissions
      // ────────────────────────────────────────────────────────────────
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [constants.AddressZero, SYNC_RECEIPT, NORMAL_TIMELOCK], // wildcard: every YieldGroup on every Hub
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [constants.AddressZero, SYNC_RECEIPT, GUARDIAN], // wildcard, as the Guardian's other Hub roles are
      },
      // The Normal Timelock has no updateResourceAdapter role on the USDC groups; the USDT ones already have it
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_SOURCE_USDC, UPDATE_RESOURCE_ADAPTER, NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [FRV_SOURCE_USDC, UPDATE_RESOURCE_ADAPTER, NORMAL_TIMELOCK],
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
        params: [resource, adapter],
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
