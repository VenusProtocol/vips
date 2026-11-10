---
name: writing-vips
description: Use when writing, drafting or restructuring a VIP under vips/ or multisig/proposals/ (market or pool listings, ACM grants, oracle configs, upgrades, aggregator batches), or when a VIP file has grown builder functions, input types, flags or generated description text that make it hard to review.
---

# Writing VIPs

A VIP runs once, and before that a reviewer checks every target, signature, param and number in it against the chain. So it is written to be read top to bottom, not to be efficient or DRY. A reviewer should see each command in execution order, with its values, without running code, and find every imported name one hop from where it is defined.

Read one of these before writing. They are the house style:

| File                                                       | Shows                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `vips/vip-673/bscmainnet.ts` + `permissions-bscmainnet.ts` | an upgrade, ACM grants as aggregator batches, four positions written out with a comment each |
| `vips/vip-661/bscmainnet.ts`                               | a yield group onboarding, `.map` over a list of resources                                    |
| `vips/vip-667/bscmainnet.ts`                               | an oracle config and a vault listing, tuple params with a comment per field                  |
| `vips/vip-610/bscmainnet.ts`                               | a permission-heavy VIP in numbered sections                                                  |
| `vips/vip-440/bscmainnet.ts`                               | a market listing, every command written out                                                  |

## 1. Files

```
vips/vip-NNN/
  bscmainnet.ts               # everything for that network
  bsctestnet.ts               # same shape, testnet values
  permissions-bscmainnet.ts   # only when the ACM grant list runs past ~50 entries
simulations/vip-NNN/
  bscmainnet.ts               # imports the VIP's constants and asserts against them
  abi/
```

Each network file reads on its own. A VIP split into parts gets one file per part, each with its own commands written out, not a shared `commands.ts` that takes a `part` argument. Don't add `addresses/`, `config.ts`, `utils/` or `commands.ts`.

## 2. Inside the file, top to bottom

1. Imports, then `const { NORMAL_TIMELOCK, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bscmainnet;`
2. Every other address and value as an `export const`, checksummed, grouped under short dividers, with a trailing comment where the unit or source isn't obvious: `export const OPEN_DURATION = 604800; // 7 days`.
3. `export const vipNNN = () => { const meta = {...}; return makeProposal([...], meta, ProposalType.REGULAR); };`
4. `export default vipNNN;`

The title is a literal string, `"VIP-673 [BNB Chain] EBrake Liquidity Hub pausing and Hub NAV deviation sentinel"`. The description is markdown written out: `#### Summary`, `#### Actions` numbered the same as the code sections, `#### Notes`, `#### References`, plus `#### Market parameters` or `#### Deployed contracts` where the VIP needs them. Numbers appear as the voter reads them ("90%", "8,000,000 USDT"). Interpolating an address constant (`${HUB_NAV_SENTINEL}`) is fine. Building the text with `pct()`, `tokens()` or `marketLines(part).join("\n")` is not, because then nobody can read the proposal without running it.

An address not known yet, such as an undeployed contract or an account still to be named, gets a distinct placeholder (`"0x1000000000000000000000000000000000000001"`) under one `// PLACEHOLDERS` divider that says what replaces each one. The sim puts stand-ins at those addresses, and replacing them is the first step of preparing the VIP for proposal. No `PENDING` values, input types or `assertComplete()` throws.

A value that depends on an earlier VIP, such as a queue it extends, is written as the value it holds after that VIP, with the VIP number in a comment. The sim forks after that VIP or applies it first with `pretendExecutingVip`.

## 3. Commands

Every command sits inline in the one `makeProposal([...])` array, in execution order, under numbered dividers that match the description's Actions:

```ts
      // ────────────────────────────────────────────────────────────────
      // 3. Sentinel keeper
      // ────────────────────────────────────────────────────────────────
      { target: HUB_NAV_SENTINEL, signature: "setTrustedKeeper(address,bool)", params: [KEEPER, true] },
```

Loop when the same command repeats over a list the reviewer checks once as data, such as markets, resources or roles:

```ts
      ...CENTRIFUGE_RESOURCES.map(resource => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [resource, ADAPTER_CENTRIFUGE],
      })),
```

The loop body is one literal command, or a fixed run of two to four with `flatMap`, one level deep. Loop over three or more items. Write one or two out, and write them out at any count when each one needs its own comment. A helper that returns a single command, like vip-610's `giveCallPermission(contract, sig, account)`, is fine.

If a market or step needs different commands from its siblings, write its commands out. Don't add a flag to a shared builder (`listMarket(m, fromTreasury)`), a conditional spread (`...(cond ? [...] : [])`), a `.map` inside a spread inside a `.map`, or a function per stage (`poolCommands(inputs)`) that the array only calls.

## 4. Comments

A comment is one line, sits beside the command it explains, and says why: `// before addMarket: a collateral factor above 0 needs a price`. An order constraint goes on the command that depends on it. Execution preconditions, what the VIP leaves out and why it is split go in the description's Notes, one bullet each, not in a banner at the top of the file.

## 5. Permissions, batches and imports

A long ACM list goes in `permissions-bscmainnet.ts` as grouped role tables of `{ contracts, signatures, accounts }`, expanded by one small helper (vip-673's `expand`), with a comment on each group saying who gets it and why.

Each aggregator batch is an explicit `batch([...], { raw: true })` in its place in the array. Its commands are written inside it the same way as anywhere else, numbered dividers included. A batch of uniform grants can be `batch(GRANT_PERMISSIONS.map(...))`. Add `seededIndex: N` once `seedAggregatorBatches` has stored it. When one batch is too big, split it by purpose into adjacent `batch()` calls, with the entry count beside each (vip-673's `REVOKE_BATCHES`). Don't write a loop that sizes batches by counting entries.

Addresses and role lists come from `NETWORK_ADDRESSES`, or by name from the earlier VIP file that defines them (`import { SPOKE_SOURCE_USDT } from "../vip-669/addresses/bscmainnet"`). A single address from an unrelated VIP reads better written out, with a comment naming where it comes from. No `export *` chains through several VIPs.

## Red flags

| If you're writing                                       | Write instead                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `type XInputs`, `PENDING`, `assertComplete()`           | constants, with placeholders under `// PLACEHOLDERS`           |
| `const VIP_NUMBER = 678` and a template title           | the literal title                                              |
| `pct()`, `tokens()`, `marketLines()` in the description | the sentence with the number in it                             |
| `listMarket(m, true)`, `...(flag ? [...] : [])`         | the commands written out                                       |
| `toBatches(commands)` chunking by entry count           | adjacent `batch()` calls split by purpose                      |
| `export *` from an earlier VIP's address book           | a named import from the file that defines it                   |
| a 40-line header comment                                | one-line comments at the commands, the rest in the description |
| a helper exported only for the sim                      | the sim's own expected values, or the VIP's exported constants |
