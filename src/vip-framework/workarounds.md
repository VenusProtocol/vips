# Oracle staleness and ACM checks in VIP simulations

`testVip` forks at one block and then skips about **4.2 days** for a BSC Normal VIP (192,384 voting blocks at 1 second each, plus the 48-hour timelock). Feeds don't update on a fork, so any feed with a shorter `maxStalePeriod` goes stale and the VIP or the post-VIP checks revert with `invalid resilient oracle price`. The helpers in [`oracleStaleness.ts`](oracleStaleness.ts) keep those prices valid.

## Which helper to call

Call them in the sim's top-level `before()`, so they run before `testVip`.

| Situation                                                                                                         | Call                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| The sim prices an asset, directly or through a user's markets                                                     | `bypassStalePrices([asset])`                                                                                         |
| The sim also asserts that asset's `maxStalePeriod`                                                                | `bypassStalePrices([...], { pinOnly: [asset] })`                                                                     |
| The VIP adds a feed or changes its `maxStalePeriod`, including each feed of a newly listed asset                  | `pinOracleFeedPrice(oracle, { asset, feed, maxStalePeriod })` with the VIP's values, once per feed                   |
| The VIP makes an asset read an oracle it doesn't read today (enables a disabled one, or repoints ResilientOracle) | `pinOracleFeedPrice(oracle, { asset })`, which reuses the oracle's current config                                    |
| The VIP adds a correlated oracle                                                                                  | `bypassStalePrices([underlying])`, plus `pinOracleFeedPrice(intermediate, { asset: correlatedToken })` if it has one |

From [`simulations/vip-656/bscmainnet.ts`](../../simulations/vip-656/bscmainnet.ts), where the VIP clones BTCB's feeds onto vceBTC and the sim asserts BTCB's windows afterwards:

```ts
before(async () => {
  for (const { address, feed, maxStalePeriod } of BTCB_ORACLE_CONFIGS) {
    await pinOracleFeedPrice(address, { asset: VCEBTC, feed, maxStalePeriod });
  }
  await bypassStalePrices([SUPPLY_ASSET], { pinOnly: [BTCB] });
});
```

To cover every market a test account holds, build the list from `comptroller.getAssetsIn(account)`, mapping each vToken to its underlying and vBNB to `ORACLE_BNB`.

## What the helpers change

`bypassStalePrices` walks every enabled oracle behind each asset, following correlated oracles into their underlying asset and intermediate oracle. An `assets` entry gets a one-year `maxStalePeriod` on each feed, plus a pinned direct price if the feed is older than even that. A `pinOnly` entry keeps its window and is pinned only where it would go stale. It's also skipped when another asset's walk reaches it, so listing slisBNB doesn't widen a pinned BNB.

`pinOracleFeedPrice` applies the VIP's feed config in a dry run, throws if that feed can't price the asset right now, and pins the current price if it would go stale. The VIP's `setTokenConfig` never clears a direct price, so the pin survives the VIP and the sim can still assert the VIP's `maxStalePeriod`.

Both look **7 days** ahead and treat a feed still fresh after that as fresh for the whole sim. That covers one VIP with room to spare, but a sim that runs several VIPs or warps further can still hit a stale feed. We accept this because windows over 7 days are rare and the failure is a loud revert, not a wrong result.

Known limits:

- Only Chainlink-style oracles (Chainlink, RedStone, Atlas) and correlated oracles are handled. Any other oracle that would go stale, such as Binance or SFrxETH, prints `Unhandled oracle … fix it explicitly`, and the sim fixes it by hand (for Binance, `setMaxStalePeriodInBinanceOracle` in `src/utils.ts`).
- A direct price hides the feed. If the oracle already has one for the asset, from mainnet or an earlier pin, `pinOracleFeedPrice`'s broken-feed check passes without reading the feed. Call it before `bypassStalePrices` so at least our own pin can't hide it.
- The helpers act as the Normal Timelock and set its native balance to 1 (BNB, ETH, …), overwriting any earlier `initMainnetUser` top-up. This matters only if the sim spends or asserts that balance.

If the oracle's ACM refuses the Normal Timelock (a new oracle, for example), the helpers grant that one signature on `oracle.accessControlManager()`, make the call and revoke it. This needs no per-network branching, because both ACM builds have `giveCallPermission` / `revokeCallPermission` and the Normal Timelock is ACM admin on all 16 networks (checked on-chain 2026-09-29).

## ACM permission checks

Use one pattern on every chain: `isAllowedToCall` with the target contract as `from`, and `RoleGranted` for events. Both ACM builds implement these the same way, `isAllowedToCall` checks the exact target and then falls back to a wildcard grant, and `RoleGranted` fires once per new grant on both. From [`simulations/vip-640/bscmainnet.ts`](../../simulations/vip-640/bscmainnet.ts):

```ts
expect(await accessControlManager.isAllowedToCall(caller, fn, { from: INSTITUTIONAL_VAULT_CONTROLLER })).to.be.false;
```

The tradeoff is that it can't tell an exact grant from a wildcard. That's fine for a sim, which cares whether the call is allowed, and the pre-VIP `false` assert catches a wildcard that already existed. To prove a wildcard grant itself, check its hash with `hasRole`, and that hash is where the two builds split.

BSC mainnet (`0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555`) runs an older ACM build. Every other chain, bsctestnet included, runs the build in `@venusprotocol/governance-contracts`, so don't write a BSC mainnet assert from the repo source. The differences, checked on bscmainnet, bsctestnet and ethereum forks on 2026-09-29:

|                                       | BSC mainnet (older)                                                                                              | Other chains (newer)                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `hasPermission(account, target, sig)` | **Reverts**, not in this build                                                                                   | Exact target only, never a wildcard                               |
| `PermissionGranted`                   | Never emitted                                                                                                    | Emitted on every `giveCallPermission`, even for an existing grant |
| Wildcard role hash                    | `solidityKeccak256(["bytes32", "string"], [HashZero, sig])`                                                      | `solidityKeccak256(["address", "string"], [AddressZero, sig])`    |
| Revoking a wildcard                   | `revokeCallPermission(AddressZero, …)` **succeeds but revokes nothing**; use `revokeRole(wildcardHash, account)` | `revokeCallPermission(AddressZero, sig, account)`                 |

A wildcard is global: one on `setTokenConfig(TokenConfig)` covers the ResilientOracle, every ChainlinkOracle, and any later contract that checks the same signature.

For the ABI, copy [`simulations/vip-654/abi/accessControlManager.json`](../../simulations/vip-654/abi/accessControlManager.json), which has `isAllowedToCall`, `hasRole` and `RoleGranted` and works on every chain. [`simulations/vip-633/abi/AccessControlManager.json`](../../simulations/vip-633/abi/AccessControlManager.json) has only `hasPermission` and `PermissionGranted`, so it breaks on BSC mainnet.
