import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, GUARDIAN, AUXILIARY_COMMANDS_AGGREGATOR } =
  NETWORK_ADDRESSES.bsctestnet;

export const AGGREGATOR = AUXILIARY_COMMANDS_AGGREGATOR;
// As on mainnet after VIP-645: the Critical Timelock gets no aggregator permissions.
export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];
export const TIMELOCK_SIGNATURES = [
  "executeBatch(uint256)",
  "addAuthorizedBatchers(address[])",
  "removeAuthorizedBatchers(address[])",
];
// The VIP-628 batchers plus the Guardian and the Normal Timelock, as on mainnet.
export const BATCHERS = [
  "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de",
  "0xb0767a856E5D4cCaF2c11355510d28C4E2922D62",
  "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7",
  GUARDIAN,
  NORMAL_TIMELOCK,
];

export const vip668 = () => {
  const meta = {
    version: "v2",
    title: "VIP-668 [BNB Chain Testnet] Wire the AuxiliaryCommandsAggregator",
    description: `#### Summary

If passed, this VIP wires the AuxiliaryCommandsAggregator deployed on BNB Chain testnet, already on the implementation proposed for the mainnets: the Normal Timelock accepts its ownership, the Normal and FastTrack timelocks are allowed to call executeBatch, addAuthorizedBatchers and removeAuthorizedBatchers, and the batcher allowlist is seeded with the VIP-628 batchers plus the Guardian and the Normal Timelock, as on mainnet.

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      { target: AGGREGATOR, signature: "acceptOwnership()", params: [] },
      ...TIMELOCK_SIGNATURES.flatMap(signature =>
        TIMELOCKS.map(timelock => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [AGGREGATOR, signature, timelock],
        })),
      ),
      { target: AGGREGATOR, signature: "addAuthorizedBatchers(address[])", params: [BATCHERS] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip668;
