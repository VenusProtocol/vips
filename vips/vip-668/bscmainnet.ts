import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// ===================================================================================================
// VIP-668 [Multichain] — Upgrade the AuxiliaryCommandsAggregator implementation
// ===================================================================================================

const { bscmainnet, ethereum, arbitrumone, basemainnet, zksyncmainnet } = NETWORK_ADDRESSES;

export const AGGREGATOR_BSC = bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR;
export const AGGREGATOR_ETHEREUM = ethereum.AUXILIARY_COMMANDS_AGGREGATOR;
export const AGGREGATOR_ARBITRUM = arbitrumone.AUXILIARY_COMMANDS_AGGREGATOR;
export const AGGREGATOR_BASE = basemainnet.AUXILIARY_COMMANDS_AGGREGATOR;
export const AGGREGATOR_ZKSYNC = zksyncmainnet.AUXILIARY_COMMANDS_AGGREGATOR;

export const PROXY_ADMIN_BSC = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PROXY_ADMIN_ETHEREUM = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
export const PROXY_ADMIN_ARBITRUM = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const PROXY_ADMIN_BASE = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const PROXY_ADMIN_ZKSYNC = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";

// governance-contracts PR #182 (merge 406e8d4a), deployments/<network>/AuxiliaryCommandsAggregator_Implementation.json
export const NEW_IMPL_BSC = "0x459cbFFFA49530422fD81c3415686eD2187d047D";
export const NEW_IMPL_ETHEREUM = "0x05B2EC5B7437FB188175bf440e3EB36af79fe319";
export const NEW_IMPL_ARBITRUM = "0x75A71Ad878f6f24616A2AE21d046C0C8E72f67F8";
export const NEW_IMPL_BASE = "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56";
export const NEW_IMPL_ZKSYNC = "0x59B60d543EA456942040DC6B48ECDA10d867A41C";

export const vip668 = () => {
  const meta = {
    version: "v2",
    title: "VIP-668 [Multichain] Upgrade the AuxiliaryCommandsAggregator",
    description: `#### Summary

If passed, this VIP upgrades the AuxiliaryCommandsAggregator on BNB Chain, Ethereum, Arbitrum One, Base and ZKsync Era. In the new implementation each pre-seeded call is stored as a function signature plus ABI-encoded arguments, the same format the Timelock uses, so a seeded batch can be reviewed the same way as a governance proposal before it runs.

#### Description

The AuxiliaryCommandsAggregator runs a pre-seeded batch of commands through a single \`executeBatch(index)\` call. Governance uses it for proposals that would otherwise exceed the proposal gas limit, the 100-operation limit or the LayerZero payload limit. Until now each call was stored as an address and raw calldata, so a batch could only be read back as opaque bytes.

The new implementation changes the aggregator as follows:

- **Call format**: a call is a function signature plus ABI-encoded arguments, or an empty signature with the full calldata, exactly as \`Timelock.executeTransaction\` reads them. The raw form stays available where gas matters.
- **Single execution**: a batch can be executed only once. A replay reverts with \`BatchAlreadyExecuted\`, and the flag is set before the calls run, so a batch cannot re-enter itself.
- **Checks when a batch is added**: a target without code reverts with \`InvalidTarget\`, and an empty signature with calldata shorter than a function selector reverts with \`MissingSelector\`. Mistakes fail when the batch is seeded, not after a vote.
- **Revert reasons**: \`CallFailed\` now carries the revert data of the failing call.
- **Rename**: \`batchCount()\` becomes \`getBatchCount()\`.

**Storage**: the previous batches array is retired in place and its slot is never reused. The new batches array and the executed flags take two slots from the storage gap. Batches seeded under the previous implementation are not carried over: after the upgrade, \`getBatchCount()\` returns 0 on every chain. The authorized batchers and the Access Control Manager do not change, and no initializer runs.

The ACMCommandsAggregator is deprecated in the same release. It holds no role in the Access Control Manager on any of these chains, so no on-chain action is needed for it.

#### Actions

On each of the five chains, the DefaultProxyAdmin (owned by the chain's Normal Timelock) upgrades the AuxiliaryCommandsAggregator proxy to the new implementation.

#### Security and additional considerations

- **VIP execution simulation**: on a fork of each chain, the proxy points to the new implementation, the Access Control Manager and the authorized batchers are unchanged, the batch count starts at 0, and an authorized batcher can add a batch in the new signature format.
- **Deployed bytecode**: on every chain, the code at the new implementation address matches the governance-contracts build artifact.
- **Tests**: unit tests and a BNB Chain mainnet fork test in governance-contracts.

#### Deployed contracts

New AuxiliaryCommandsAggregator implementations:

- BNB Chain: [${NEW_IMPL_BSC}](https://bscscan.com/address/${NEW_IMPL_BSC})
- Ethereum: [${NEW_IMPL_ETHEREUM}](https://etherscan.io/address/${NEW_IMPL_ETHEREUM})
- Arbitrum One: [${NEW_IMPL_ARBITRUM}](https://arbiscan.io/address/${NEW_IMPL_ARBITRUM})
- Base: [${NEW_IMPL_BASE}](https://basescan.org/address/${NEW_IMPL_BASE})
- ZKsync Era: [${NEW_IMPL_ZKSYNC}](https://explorer.zksync.io/address/${NEW_IMPL_ZKSYNC})

#### References

- [AuxiliaryCommandsAggregator changes](https://github.com/VenusProtocol/governance-contracts/pull/182)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/TBD)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN_BSC,
        signature: "upgrade(address,address)",
        params: [AGGREGATOR_BSC, NEW_IMPL_BSC],
      },
      {
        target: PROXY_ADMIN_ETHEREUM,
        signature: "upgrade(address,address)",
        params: [AGGREGATOR_ETHEREUM, NEW_IMPL_ETHEREUM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [AGGREGATOR_ARBITRUM, NEW_IMPL_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [AGGREGATOR_BASE, NEW_IMPL_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [AGGREGATOR_ZKSYNC, NEW_IMPL_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip668;
