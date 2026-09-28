import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN };

// venus-periphery/deployments/bsctestnet/{HubNavDeviationSentinel,EBrake_Implementation}.json.
export const HUB_NAV_SENTINEL = "0x211c38CB5543D1dd589c06ba1a27eDcF0FE25e2f";
export const EBRAKE_NEW_IMPL = "0x99E0caa86Ef6f99c2DB622C6164d68904604Ce55";

// Live EBrake proxy, behind the chain's DefaultProxyAdmin (owned by the Normal Timelock).
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

// Liquidity Hub stack (venus-liquidity-hub/deployments/bsctestnet).
export const HUB_REGISTRY = "0x5346f648029d1D1d1034e09e8AD7a115f5D7A159";
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CENTRIFUGE_SOURCE_USDT = "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542";
export const MOCK_CENTRIFUGE_VAULT_USDT = "0xb13CA372bB11FcCfb765195b013ad59dAf3F817C";

// The only keeper the testnet DeviationSentinel has ever trusted.
export const KEEPER = GUARDIAN;

// Measured from the band's centre. 10% either way is one `setPrice` on the mock vault.
export const PAUSE_UP_BPS = 1000;
export const PAUSE_DOWN_BPS = 1000;

export const SENTINEL_CONFIG_SIGS = [
  "setTrustedKeeper(address,bool)",
  "setHubNavConfig(address,address,uint16,uint16)",
  "setMinHubNavGapBps(uint16)",
  "setNavMonitoringEnabled(address,address,bool)",
];

// What EBrake must hold on the Hub side for its Hub levers to land.
export const HUB_SIGS_FOR_EBRAKE = ["pauseHub()", "pauseYieldGroup(address)"];
export const YIELD_GROUP_SIGS_FOR_EBRAKE = ["pauseResource(address)"];

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip998 = () => {
  const meta = {
    version: "v2",
    title: "VIP-998 [BNB Chain Testnet] Liquidity Hub NAV deviation sentinel and EBrake Hub pause levers",
    description: `#### Summary

Onboards the **HubNavDeviationSentinel** on BNB Chain Testnet and upgrades **EBrake** so it can pause the
Liquidity Hub.

The sentinel watches a Hub resource's NavGuard band. When the value the resource reports sits further from
the band's centre than a governance-set threshold, a trusted keeper calls \`handleNavGuardDeviation\` and the
sentinel pauses the whole Hub through EBrake, stopping every deposit and redemption. It can only tighten:
unpausing is done on the Hub itself, never through the sentinel or EBrake.

The EBrake upgrade adds three tighten-only levers, \`pauseHub\`, \`pauseHubYieldGroup\` and
\`pauseHubResource\`, and changes nothing else. Each already-paused target is a no-op.

#### Actions

1. Upgrade the EBrake proxy to the new implementation.
2. Accept ownership of the HubNavDeviationSentinel.
3. Grant the sentinel's config surface (\`setTrustedKeeper\`, \`setHubNavConfig\`, \`setMinHubNavGapBps\`,
   \`setNavMonitoringEnabled\`) to the **Normal Timelock** and the **Guardian**.
4. Grant the sentinel \`pauseHub(address)\` on EBrake. No account is granted the other two levers; the
   Guardian can already pause the Hub directly.
5. Grant EBrake \`pauseHub()\` and \`pauseYieldGroup(address)\` on **Hub_USDT**, and \`pauseResource(address)\`
   on the **Centrifuge YieldGroup**.
6. Trust the Guardian as the sentinel's keeper, the same keeper the testnet DeviationSentinel uses, and drop
   the sentinel's minimum Hub NAV gap from 1% to 0 so a small test position can trip it.
7. Watch the Centrifuge mock vault's band with a 10% threshold on each side, twice the Hub's own 5% gaps,
   and arm it.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. Upgrade and ownership
      // ────────────────────────────────────────────────────────────────
      { target: DEFAULT_PROXY_ADMIN, signature: "upgrade(address,address)", params: [EBRAKE, EBRAKE_NEW_IMPL] },
      { target: HUB_NAV_SENTINEL, signature: "acceptOwnership()", params: [] },

      // ────────────────────────────────────────────────────────────────
      // 2. ACM permissions
      // ────────────────────────────────────────────────────────────────
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(account =>
        SENTINEL_CONFIG_SIGS.map(sig => giveCallPermission(HUB_NAV_SENTINEL, sig, account)),
      ),
      giveCallPermission(EBRAKE, "pauseHub(address)", HUB_NAV_SENTINEL),
      ...HUB_SIGS_FOR_EBRAKE.map(sig => giveCallPermission(HUB_USDT, sig, EBRAKE)),
      ...YIELD_GROUP_SIGS_FOR_EBRAKE.map(sig => giveCallPermission(CENTRIFUGE_SOURCE_USDT, sig, EBRAKE)),

      // ────────────────────────────────────────────────────────────────
      // 3. Sentinel configuration
      // ────────────────────────────────────────────────────────────────
      { target: HUB_NAV_SENTINEL, signature: "setTrustedKeeper(address,bool)", params: [KEEPER, true] },
      // Testnet Hub NAV reads ~9.5e16 USDT, so the default 1% floor would screen out every breach.
      { target: HUB_NAV_SENTINEL, signature: "setMinHubNavGapBps(uint16)", params: [0] },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS],
      },
      {
        target: HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip998;
