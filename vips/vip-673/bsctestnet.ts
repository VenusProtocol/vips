import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } =
  NETWORK_ADDRESSES.bsctestnet;

export { ACCESS_CONTROL_MANAGER, GUARDIAN };

export const NEW_HUB_NAV_SENTINEL_IMPLEMENTATION = "0xF1E441C9035DE99714c013832Eca5060AA36Ec8a";

const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const HUB_NAV_SENTINEL = "0x347fBbC71C07496fbBb2fEc5D2a036605F14089D";
export const OLD_HUB_NAV_SENTINEL_IMPLEMENTATION = "0xCDfea50f7CECCB24Fe804657DB8E6c93b689941e";
export const HUB_REGISTRY = "0x5346f648029d1D1d1034e09e8AD7a115f5D7A159";
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CENTRIFUGE_SOURCE_USDT = "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542";
export const CENTRIFUGE_VAULT_USDT = "0x8a3C1f806B635230b74741066DE9B0Aa902F83dC";
export const PAUSE_UP_BPS = 1000;
export const PAUSE_DOWN_BPS = 1000;
export const MIN_PAUSE_GAP = parseUnits("10", 6);

export const vip995 = () => {
  const meta = {
    version: "v2",
    title: "VIP-995 [BNB Chain Testnet] HubNavDeviationSentinel audit fixes and EBrake Hub pause permissions",
    description: `#### Summary

Upgrades the HubNavDeviationSentinel on BNB Chain Testnet to its HashDit-audited build. In that build, a fixed minimum gap per resource replaces the old Hub NAV gate. The VIP also moves the sentinel's setter permission to the new signature, and grants EBrake's new Hub pause actions to governance and the Guardian.

#### Actions

1. Upgrade the **HubNavDeviationSentinel** proxy to [${NEW_HUB_NAV_SENTINEL_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_HUB_NAV_SENTINEL_IMPLEMENTATION}). This build:
   - sizes pause thresholds from the drift-grown anchor
   - pauses when an open band reads zero
   - replaces \`setMinHubNavGapBps\` with a \`minPauseGap\` argument on \`setHubNavConfig\`
2. Revoke 4 ACM permissions: the Normal Timelock's and the Guardian's old \`setHubNavConfig\` and \`setMinHubNavGapBps\` on the sentinel.
3. Grant 14 ACM permissions:
   - the Normal Timelock and the Guardian: the sentinel's new \`setHubNavConfig\`
   - the Guardian and the three Timelocks: EBrake's \`pauseHub\`, \`pauseHubYieldGroup\` and \`pauseHubResource\`. They already hold every other EBrake action.
4. Reconfigure the Centrifuge USDT vault with its current 10% bands and a 10 USDT minimum gap. Until this runs, the upgraded proxy reads the vault's minimum gap as zero.

#### Notes

- Testnet only.
- The proxy address stays the same. The Guardian remains its keeper, and the configuration of the monitored vault carries over.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. Sentinel upgrade
      // ────────────────────────────────────────────────────────────────
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [HUB_NAV_SENTINEL, NEW_HUB_NAV_SENTINEL_IMPLEMENTATION],
      },

      // ────────────────────────────────────────────────────────────────
      // 2. ACM permissions
      // ────────────────────────────────────────────────────────────────
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(account =>
        ["setHubNavConfig(address,address,uint16,uint16)", "setMinHubNavGapBps(uint16)"].map(signature => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "revokeCallPermission(address,string,address)",
          params: [HUB_NAV_SENTINEL, signature, account],
        })),
      ),
      ...[NORMAL_TIMELOCK, GUARDIAN].map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [HUB_NAV_SENTINEL, "setHubNavConfig(address,address,uint16,uint16,uint256)", account],
      })),
      ...[GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(account =>
        ["pauseHub(address)", "pauseHubYieldGroup(address)", "pauseHubResource(address,address)"].map(signature => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [EBRAKE, signature, account],
        })),
      ),

      // ────────────────────────────────────────────────────────────────
      // 3. Monitored vault, with the minimum gap the new setter takes
      // ────────────────────────────────────────────────────────────────
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16,uint256)",
        params: [CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS, MIN_PAUSE_GAP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip995;
