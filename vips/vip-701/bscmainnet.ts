import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

// Access Control Manager
export const ACM = NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER;

// EBrake (configured in VIP-610)
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";

// Executor — tighten-only validation layer between off-chain signal monitors and EBrake
// TODO: replace with deployed Executor address once deployment VIP merges
export const EXECUTOR = "0x0000000000000000000000000000000000000000";

// Off-chain signal monitor authorized to call Executor action handlers
// TODO: replace with final monitor EOA/contract address
export const SIGNAL_MONITOR = "0x0000000000000000000000000000000000000000";

// Executor action functions the signal monitor invokes
export const EXECUTOR_MONITOR_PERMS = [
  "handleLTVAdjust(address,uint256)",
  "handleCapAdjust(address,uint8,uint256)",
  "handleSupplyHalt(address)",
  "handleBorrowHalt(address)",
];

// Executor governance function — sets per-market bounds (originalLTV, minBorrowCap,
// minSupplyCap, originalBorrowCap, originalSupplyCap, enabled)
export const EXECUTOR_GOVERNANCE_PERMS = ["setMarketConfig(address,(uint256,uint256,uint256,uint256,uint256,bool))"];

// EBrake functions the Executor calls
export const EBRAKE_EXECUTOR_PERMS = [
  "pauseBorrow(address)",
  "pauseSupply(address)",
  "decreaseCF(address,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

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

**1. Grant Signal Monitor permissions on Executor action handlers**

- Authorize the off-chain monitor to call \`handleLTVAdjust\`, \`handleCapAdjust\`, \`handleSupplyHalt\`, \`handleBorrowHalt\`

**2. Grant Executor permissions on EBrake**

- Authorize the Executor to call \`pauseBorrow\`, \`pauseSupply\`, \`decreaseCF\`, \`setMarketBorrowCaps\`, \`setMarketSupplyCaps\` on EBrake

**3. Grant Normal Timelock permission to call \`setMarketConfig\` on Executor**

- Lets governance set per-market bounds (\`originalLTV\`, \`minBorrowCap\`, \`minSupplyCap\`, \`originalBorrowCap\`, \`originalSupplyCap\`, \`enabled\`)

#### References

- [GitHub PR: VenusProtocol/venus-periphery#61](https://github.com/VenusProtocol/venus-periphery/pull/61)
- VPD-925 — Phase -1 Executor`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Signal monitor → Executor action handlers
      ...EXECUTOR_MONITOR_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, SIGNAL_MONITOR)),

      // 2. Executor → EBrake
      ...EBRAKE_EXECUTOR_PERMS.map(sig => giveCallPermission(EBRAKE, sig, EXECUTOR)),

      // 3. Normal Timelock → Executor governance function
      ...EXECUTOR_GOVERNANCE_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, NORMAL_TIMELOCK)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip701;
