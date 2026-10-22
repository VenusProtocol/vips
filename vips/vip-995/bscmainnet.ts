import { parseUnits } from "ethers/lib/utils";
import { batch } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CENTRIFUGE_SOURCE_USDC,
  CENTRIFUGE_SOURCE_USDT,
  EBRAKE,
  HUB_NAV_SENTINEL,
  HUB_OPERATOR,
  PERMISSIONS,
  REVOKE_BATCHES,
} from "./permissions-bscmainnet";

const { ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bscmainnet;

export const NEW_EBRAKE_IMPLEMENTATION = "0xeB18c8B6d0ddc13D3d7A8cD5FF684F11E5bcBCfb";

const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
// Already the trusted keeper of DeviationSentinel on BNB Chain (VIP-590) and on the remote chains (VIP-616)
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
3. Grant 53 ACM permissions:
   - EBrake: \`pauseHub()\`, \`pauseYieldGroup(address)\` and \`pauseResource(address)\` as wildcards (contract address zero), so they cover the USDT, USDC and U Hubs, their 11 YieldGroups, and any Hub or YieldGroup added later
   - the Normal Timelock and the Guardian: the same three pauses, and \`unpauseHub()\`, \`unpauseYieldGroup(address)\` and \`unpauseResource(address)\`, as wildcards. Both can then pause a Hub directly if EBrake cannot. They already hold these on every live Hub and YieldGroup, except the Guardian's Hub and YieldGroup unpauses, which are new.
   - the YieldGroup roles each live Core and Flux source grants one by one, as wildcards, so a new YieldGroup needs no grants: nine to the Normal Timelock (\`addResource\`, \`removeResource\`, \`updateResourceAdapter\`, both inner queues, \`sweep\`, both resource caps and \`setBlocksPerYear\`), \`updateResourceAdapter\` to the Guardian, and both inner queues, \`pauseResource\`, \`unpauseResource\` and both resource caps to the Hub operator multisig [${HUB_OPERATOR}](https://bscscan.com/address/${HUB_OPERATOR})
   - the Guardian, the Normal and Fast-track Timelocks and the Venus team multisig: EBrake's three new actions. They already hold its market pause actions.
   - the Guardian and the Normal and Fast-track Timelocks: the sentinel's three setters
   - the sentinel: \`pauseHub(address)\` on EBrake
4. Revoke the 216 per-contract grants on the live Hubs and YieldGroups that the new wildcards make redundant, so each role is held in one place. These run as three batches pre-stored on the AuxiliaryCommandsAggregator, which holds the AccessControlManager admin role only while the batches run.
5. Register the keeper [${KEEPER}](https://bscscan.com/address/${KEEPER}) on the sentinel. It is the keeper that already drives DeviationSentinel.
6. Configure and arm the sentinel for the JTRSY and JAAA positions on both Hubs. The sentinel pauses the Hub when a position's value is more than 4% above or 8% below its band centre (measured as a share of the band's anchor), and only when that gap exceeds 10,000 USDT or USDC.

#### Notes

- The sentinel can only pause. Unpausing a Hub stays with the Normal Timelock and the Guardian.
- On the live Hubs and YieldGroups, the wildcards and revokes together change only one thing: the Guardian can now unpause a Hub and a YieldGroup.
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
      ...REVOKE_BATCHES.map(revokes =>
        batch(
          revokes.map(({ contract, signature, account }) => ({
            target: ACCESS_CONTROL_MANAGER,
            signature: "revokeCallPermission(address,string,address)",
            params: [contract, signature, account],
          })),
          { raw: true },
        ),
      ),

      // ────────────────────────────────────────────────────────────────
      // 3. Sentinel keeper
      // ────────────────────────────────────────────────────────────────
      {
        target: HUB_NAV_SENTINEL,
        signature: "setTrustedKeeper(address,bool)",
        params: [KEEPER, true],
      },

      // ────────────────────────────────────────────────────────────────
      // 4. NavGuard monitoring: pause thresholds, then arming, for each Centrifuge position
      // ────────────────────────────────────────────────────────────────
      // JTRSY on the USDT Hub
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
      // JAAA on the USDT Hub
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
      // JTRSY on the USDC Hub
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
      // JAAA on the USDC Hub, no deposits yet so its band is still closed
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
