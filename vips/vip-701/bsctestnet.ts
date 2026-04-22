import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

// Access Control Manager (BSC testnet)
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

// EBrake testnet (deployed in VIP-661 Testnet addendum)
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";

// Executor — tighten-only validation layer between off-chain signal monitors and EBrake
// TODO: replace with deployed Executor testnet address
export const EXECUTOR = "0x0000000000000000000000000000000000000000";

// Off-chain signal monitor authorized to call Executor action handlers
// TODO: replace with final monitor EOA/contract address on testnet
export const SIGNAL_MONITOR = "0x0000000000000000000000000000000000000000";

export const EXECUTOR_MONITOR_PERMS = [
  "handleLTVAdjust(address,uint256)",
  "handleCapAdjust(address,uint8,uint256)",
  "handleSupplyCapExceeding(address)",
  "handleBorrowCapExceeding(address)",
];

export const EXECUTOR_GOVERNANCE_PERMS = ["setMarketConfig(address,(uint256,uint256,bool))"];

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

export const vip701Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-701 [BNB Testnet] Configure tighten-only Executor for signal-driven risk parameter control",
    description: `#### Summary

Configures the **Executor** contract on BSC testnet — tighten-only validation layer between off-chain signal monitors and EBrake.

1. Grant signal monitor permissions on Executor action handlers (handleLTVAdjust, handleCapAdjust, handleSupplyCapExceeding, handleBorrowCapExceeding)
2. Grant Executor permissions on EBrake (pauseBorrow, pauseSupply, decreaseCF, setMarketBorrowCaps, setMarketSupplyCaps)
3. Grant Guardian and all three Timelocks (Normal, Fast Track, Critical) permission to call setMarketConfig on Executor

#### References

- [GitHub PR: VenusProtocol/venus-periphery#61](https://github.com/VenusProtocol/venus-periphery/pull/61)
- VPD-925 — Phase -1 Executor`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Signal monitor → Executor action handlers
      ...EXECUTOR_MONITOR_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, SIGNAL_MONITOR)),

      // 2. Executor → EBrake
      ...EBRAKE_EXECUTOR_PERMS.map(sig => giveCallPermission(EBRAKE, sig, EXECUTOR)),

      // 3. Guardian + all timelocks → Executor governance function
      ...[GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(account =>
        EXECUTOR_GOVERNANCE_PERMS.map(sig => giveCallPermission(EXECUTOR, sig, account)),
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip701Testnet;
