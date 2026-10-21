import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CENTRIFUGE_SOURCE_USDC,
  CENTRIFUGE_SOURCE_USDT,
  EBRAKE,
  HUB_NAV_SENTINEL,
  PERMISSIONS,
} from "./permissions-bscmainnet";

const { ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bscmainnet;

export const NEW_EBRAKE_IMPLEMENTATION = "0xeB18c8B6d0ddc13D3d7A8cD5FF684F11E5bcBCfb";

const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const KEEPER = "0x57fa23f591203f61cef84a7bc892df69ca95c86e";

// Centrifuge vaults, the only Hub resources with a NavGuard band
export const JTRSY_USDT = "0x6e6B8498415083a4386BE83DD59Edd4366402FFa";
export const JAAA_USDT = "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99";
export const JTRSY_USDC = "0x5aa84705a2CB2054ed303565336F188e6bfFbAF5";
export const JAAA_USDC = "0x9effaa5614c689fA12892379e097b3ACaD239961";

// Each sits outside the bands' own 2% up / 5% down gap, so the Hub's
// routine clamping alone never trips a pause.
export const PAUSE_UP_BPS = 400;
export const PAUSE_DOWN_BPS = 800;
export const MIN_PAUSE_GAP = parseUnits("10000", 18);

export const vip995 = () => {
  const meta = {
    version: "v2",
    title: "VIP-995 [BNB Chain] EBrake Liquidity Hub pausing and Hub NAV deviation sentinel",
    description: `#### Summary

If this VIP passes, EBrake will be able to pause the Liquidity Hubs, and a new HubNavDeviationSentinel will watch the Centrifuge positions on the USDT and USDC Hubs. When a position's reported value moves well outside its NavGuard band, a keeper calls the sentinel, which pauses that Hub through EBrake.

#### Actions

1. Upgrade the **EBrake** proxy to [${NEW_EBRAKE_IMPLEMENTATION}](https://bscscan.com/address/${NEW_EBRAKE_IMPLEMENTATION}). The new implementation adds \`pauseHub\`, \`pauseHubYieldGroup\` and \`pauseHubResource\`. Its storage layout is unchanged.
2. Accept ownership of the **HubNavDeviationSentinel** at [${HUB_NAV_SENTINEL}](https://bscscan.com/address/${HUB_NAV_SENTINEL}).
3. Grant 39 ACM permissions, each on a single contract (no wildcards):
   - EBrake: \`pauseHub()\` and \`pauseYieldGroup(address)\` on the USDT, USDC and U Hubs, and \`pauseResource(address)\` on their 11 YieldGroups
   - the Guardian, the Normal and Fast-track Timelocks and the Venus multisig: EBrake's three new actions. They already hold its market pause actions.
   - the Guardian and the Normal and Fast-track Timelocks: the sentinel's three setters
   - the sentinel: \`pauseHub(address)\` on EBrake
4. Register the keeper [${KEEPER}](https://bscscan.com/address/${KEEPER}) on the sentinel. It is the keeper that already drives DeviationSentinel.
5. Configure and arm the sentinel for the JTRSY and JAAA positions on both Hubs. The sentinel pauses the Hub when a position's value is more than 4% above or 8% below its band centre (measured as a share of the band's anchor), and only when that gap exceeds 10,000 USDT or USDC.

#### Notes

- The sentinel can only pause. Unpausing a Hub stays with governance.
- It pauses the whole Hub rather than the one position, because a YieldGroup's total assets still include a paused resource.
- Both thresholds are wider than the bands' own gaps (2% up, 5% down), so normal clamping by the Hub never triggers a pause.
- The sentinel's code has been audited by HashDit, and this deployment includes the fixes from that audit.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. EBrake upgrade and HubNavDeviationSentinel ownership
      // ────────────────────────────────────────────────────────────────
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },
      { target: HUB_NAV_SENTINEL, signature: "acceptOwnership()", params: [] },

      // ────────────────────────────────────────────────────────────────
      // 2. ACM permissions
      // ────────────────────────────────────────────────────────────────
      ...PERMISSIONS.map(({ contract, signature, account }) => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [contract, signature, account],
      })),

      // ────────────────────────────────────────────────────────────────
      // 3. Keeper and NavGuard monitoring
      // ────────────────────────────────────────────────────────────────
      {
        target: HUB_NAV_SENTINEL,
        signature: "setTrustedKeeper(address,bool)",
        params: [KEEPER, true],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16,uint256)",
        params: [CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS, MIN_PAUSE_GAP],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, true],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16,uint256)",
        params: [CENTRIFUGE_SOURCE_USDT, JAAA_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS, MIN_PAUSE_GAP],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDT, JAAA_USDT, true],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16,uint256)",
        params: [CENTRIFUGE_SOURCE_USDC, JTRSY_USDC, PAUSE_UP_BPS, PAUSE_DOWN_BPS, MIN_PAUSE_GAP],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDC, JTRSY_USDC, true],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16,uint256)",
        params: [CENTRIFUGE_SOURCE_USDC, JAAA_USDC, PAUSE_UP_BPS, PAUSE_DOWN_BPS, MIN_PAUSE_GAP],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDC, JAAA_USDC, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip995;
