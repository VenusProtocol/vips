import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import coreMarketCaps from "./coreMarketCaps.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

// Access Control Manager
export const ACM = NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER;

// Marketing transfer
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const FLUX_MARKETING_WALLET = "0xBE0EdB1F457334B8d2DfEb3627567137E745A00B";
export const USDT_AMOUNT = "25000000000000000000000"; // 25,000 USDT (18 decimals)

// EBrake (configured in VIP-610)
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";

// Executor — tighten-only validation layer between off-chain signal monitors and EBrake
export const EXECUTOR = "0xDd541A1b065F9587b01815a390a4d4559D7b630F";

// Off-chain signal monitor authorized to call Executor action handlers
export const SIGNAL_MONITOR = "0x61859C84E0C6aB7B5A9801A962C660477f31a2D3";

// Executor action functions the signal monitor invokes
export const EXECUTOR_MONITOR_PERMS = [
  "handleLTVAdjust(address,uint256)",
  "handleCapAdjust(address,uint8,uint256)",
  "handleSupplyCapExceeding(address)",
  "handleBorrowCapExceeding(address)",
];

// Executor governance function — sets per-market bounds (minBorrowCap, minSupplyCap, enabled)
export const EXECUTOR_GOVERNANCE_PERMS = ["setMarketConfig(address,(uint256,uint256,bool))"];

// EBrake functions the Executor calls
export const EBRAKE_EXECUTOR_PERMS = [
  "pauseBorrow(address)",
  "pauseSupply(address)",
  "decreaseCF(address,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

// Per-market Executor configs — fully baked by scripts/fetchCoreMarketCaps.ts.
// The script already applies VIP-622 overrides and drops unlisted / zero-floor markets,
// so the VIP just emits one setMarketConfig per entry. Each entry's `capSource` in
// coreMarketCaps.json records whether the floor came from live state or VIP-622.
export const CORE_POOL_MARKET_CONFIGS: {
  address: string;
  symbol: string;
  minBorrowCap: string;
  minSupplyCap: string;
}[] = coreMarketCaps.markets.map(m => ({
  address: m.address,
  symbol: m.symbol,
  minBorrowCap: m.minBorrowCap,
  minSupplyCap: m.minSupplyCap,
}));

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip701 = () => {
  const meta = {
    version: "v2",
    title: "VIP-701 [BNB Chain] Configure tighten-only Executor for signal-driven risk parameter control",
    description: `#### Description

This VIP configures the **Executor** contract on BNB Chain mainnet — the validation layer between off-chain signal monitors and EBrake. It validates bounds on-chain and routes tightening actions to EBrake; it cannot loosen parameters. Recovery is exclusively through governance VIPs.

Depends on: VIP-610 (EBrake configuration), VPD-984 (EBrake Phase-0).

#### Proposed Changes

**1. Accept ownership of Executor and EBrake**

**2. Grant Signal Monitor permissions on Executor action handlers**

- Authorize the off-chain monitor to call \`handleLTVAdjust\`, \`handleCapAdjust\`, \`handleSupplyCapExceeding\`, \`handleBorrowCapExceeding\`

**3. Grant Executor permissions on EBrake**

- Authorize the Executor to call \`pauseBorrow\`, \`pauseSupply\`, \`decreaseCF\`, \`setMarketBorrowCaps\`, \`setMarketSupplyCaps\` on EBrake

**4. Grant Guardian and all three Timelocks (Normal, Fast Track, Critical) permission to call \`setMarketConfig\` on Executor**

- Lets governance set per-market bounds (\`minBorrowCap\`, \`minSupplyCap\`, \`enabled\`). Granting to all three timelocks + Guardian mirrors VIP-610 and lets Critical (~1h) disable a compromised market's automation instead of waiting 48h on Normal.

**5. Initialise Executor market configs for every Core Pool market**

- Call \`setMarketConfig\` on the Executor for each listed Core Pool vToken with \`enabled = true\` and per-market floors set to **20% of the effective borrow/supply cap**. Default source is [scripts/fetchCoreMarketCaps.ts](scripts/fetchCoreMarketCaps.ts) → [vips/vip-701/coreMarketCaps.json](vips/vip-701/coreMarketCaps.json) (20% of live caps). For markets being right-sized by VIP-622 (PR #706) but not yet executed, [vips/vip-701/vip622Overrides.json](vips/vip-701/vip622Overrides.json) hardcodes 20% of the post-VIP-622 caps so VIP-701 can publish without waiting for VIP-622 to land on-chain.

**6. Transfer 25,000 USDT from Venus Treasury to Flux marketing wallet**

- Funds the incoming Flux marketing campaign. Recipient: \`0xBE0EdB1F457334B8d2DfEb3627567137E745A00B\` (multisig shared with Fluid team).

#### References

- [GitHub PR: VenusProtocol/venus-periphery#61](https://github.com/VenusProtocol/venus-periphery/pull/61)
- VPD-925 — Phase -1 Executor`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Accept ownership
      { target: EXECUTOR, signature: "acceptOwnership()", params: [] },
      { target: EBRAKE, signature: "acceptOwnership()", params: [] },

      // 2. Signal monitor → Executor action handlers
      ...EXECUTOR_MONITOR_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, SIGNAL_MONITOR)),

      // 3. Executor → EBrake
      ...EBRAKE_EXECUTOR_PERMS.map(sig => giveCallPermission(EBRAKE, sig, EXECUTOR)),

      // 4. Guardian + all timelocks → Executor governance function
      ...[GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(account =>
        EXECUTOR_GOVERNANCE_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, account)),
      ),

      // 5. Initialise Executor market configs for every Core Pool market (20% floors from script snapshot)
      ...CORE_POOL_MARKET_CONFIGS.map(m => ({
        target: EXECUTOR,
        signature: "setMarketConfig(address,(uint256,uint256,bool))",
        params: [m.address, [m.minBorrowCap, m.minSupplyCap, true]],
      })),

      // 6. Transfer 25,000 USDT to Flux marketing wallet for upcoming campaign
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, FLUX_MARKETING_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip701;
