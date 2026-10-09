import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export type AggregatorChain = "bscmainnet" | "ethereum" | "arbitrumone" | "basemainnet" | "zksyncmainnet";

// New AuxiliaryCommandsAggregator implementation on each chain.
export const NEW_IMPLEMENTATION: Record<AggregatorChain, string> = {
  bscmainnet: "0x459cbFFFA49530422fD81c3415686eD2187d047D",
  ethereum: "0x05B2EC5B7437FB188175bf440e3EB36af79fe319",
  arbitrumone: "0x75A71Ad878f6f24616A2AE21d046C0C8E72f67F8",
  basemainnet: "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56",
  zksyncmainnet: "0x59B60d543EA456942040DC6B48ECDA10d867A41C",
};

// Admin of each aggregator proxy, owned by the chain's Normal Timelock.
export const PROXY_ADMIN: Record<AggregatorChain, string> = {
  bscmainnet: "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4",
  ethereum: "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9",
  arbitrumone: "0xF6fF3e9459227f0cDE8B102b90bE25960317b216",
  basemainnet: "0x7B06EF6b68648C61aFE0f715740fE3950B90746B",
  zksyncmainnet: "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287",
};

// Not part of this proposal. The simulations check that these batchers, authorized on every aggregator in VIP-628
// besides each chain's Guardian and Normal Timelock, stay authorized after the upgrade.
export const INITIAL_BATCHERS = [
  "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de",
  "0xb0767a856E5D4cCaF2c11355510d28C4E2922D62",
  "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7",
];

// Chains with an aggregator to upgrade, and the LayerZero id of the ones reached through the Omnichain sender.
const CHAINS = [
  ["bscmainnet", undefined],
  ["ethereum", LzChainId.ethereum],
  ["arbitrumone", LzChainId.arbitrumone],
  ["basemainnet", LzChainId.basemainnet],
  ["zksyncmainnet", LzChainId.zksyncmainnet],
] as const;

export const vip668 = () => {
  const meta = {
    version: "v2",
    title: "VIP-668 [Multichain] Upgrade the AuxiliaryCommandsAggregator",
    description: `#### Summary

If passed, this VIP upgrades the implementation of the AuxiliaryCommandsAggregator on BNB Chain, Ethereum, Arbitrum One, Base and zkSync Era.

#### Description

The AuxiliaryCommandsAggregator (wired in [VIP-628](https://app.venus.io/#/governance/proposal/628)) stores batches of calls ahead of a proposal, so a proposal that would exceed the limits of the Governor executes one \`executeBatch\` call instead. The new implementation changes how a batch is stored and read:

- **Readable calls.** A call is stored as a target, a function signature and its ABI-encoded arguments, as in the Timelock, so a seeded batch can be reviewed on chain by function name. A call can still be stored as raw calldata with an empty signature.
- **Index checks.** \`addBatch(calls, expectedIndex)\` refuses to seed a batch at any index but the expected one, every target must have code, and a batch runs only once.
- **Fresh batch list.** The batches seeded on the previous implementation are retired: \`getBatchCount()\` starts again from zero. The authorized batchers, the owner and the AccessControlManager permissions granted in VIP-628 are unchanged.

#### Security and additional considerations

- **Audit**: the new implementation has been reviewed by the Venus team. Its storage layout keeps the slots of the previous implementation; the retired batch list keeps its slot and is never reused.
- **Simulations**: fork simulations on every chain check the implementation after the upgrade, the retained batchers and permissions, and that a batch seeded on the upgraded aggregator executes through the Normal Timelock.
- **Deployment on testnet**: the same implementation is deployed on BNB Chain testnet.

#### Deployed contracts

- BNB Chain: [${NEW_IMPLEMENTATION.bscmainnet}](https://bscscan.com/address/${NEW_IMPLEMENTATION.bscmainnet})
- Ethereum: [${NEW_IMPLEMENTATION.ethereum}](https://etherscan.io/address/${NEW_IMPLEMENTATION.ethereum})
- Arbitrum One: [${NEW_IMPLEMENTATION.arbitrumone}](https://arbiscan.io/address/${NEW_IMPLEMENTATION.arbitrumone})
- Base: [${NEW_IMPLEMENTATION.basemainnet}](https://basescan.org/address/${NEW_IMPLEMENTATION.basemainnet})
- zkSync Era: [${NEW_IMPLEMENTATION.zksyncmainnet}](https://explorer.zksync.io/address/${NEW_IMPLEMENTATION.zksyncmainnet})

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [Source code of the AuxiliaryCommandsAggregator](https://github.com/VenusProtocol/governance-contracts/blob/develop/contracts/Utils/AuxiliaryCommandsAggregator.sol)
- [VIP-628](https://app.venus.io/#/governance/proposal/628)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    CHAINS.map(([chain, dstChainId]) => ({
      target: PROXY_ADMIN[chain],
      signature: "upgrade(address,address)",
      params: [NETWORK_ADDRESSES[chain].AUXILIARY_COMMANDS_AGGREGATOR, NEW_IMPLEMENTATION[chain]],
      dstChainId,
    })),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip668;
