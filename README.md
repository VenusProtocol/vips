# vip

### Prerequisites

- NodeJS - 16.x

- Solc - v0.8.13 (https://github.com/ethereum/solidity/releases/tag/v0.8.13)

- anvil-zksync - v0.3.0 (https://github.com/matter-labs/anvil-zksync)

### Installing

```bash
yarn install
```

### Repo structure

The simulations and create commands require the function creating the VIP to be the default export.

### Run Simulations

```bash
npx hardhat test simulations/<simulation-path> --fork <network>
```

### Run Simulations for Multisig

Simulations for multisig transactions can be run individually or sequentially. Running test for proposals can be done by passing in the index file of the network's simulation dir where each proposal test is imported.

```bash
npx hardhat test multisig/simulations/<path> --fork <network>
```

### Create Proposal

Script to generate proposal data for multiple destinations such as venusApp bscexplorer and gnosis tx builder.

Procedure for Creating a Proposal

```bash
npx hardhat createProposal --network <networkName>

Enter the number of vip for which you require proposal data.
Select the type of destination, such as txBuilder/venusApp/bsc.
Enter the governor_proxy address or enter to select the default one.
```

### Propose vip

Script to build vip calldata and target.

Procedure for Propose vip

```bash
npx hardhat run scripts/proposeVIP.ts
```

### Execute VIP (via Multisig)

Script to execute a VIP through the Gnosis Safe Multisig

Procedure for executing VIP

In .env, make sure that `DEPLOYER_PRIVATE_KEY` is the one of the multisig owner on the network (e.g. `0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C` on sepolia)

Proceed by executing the following command:

```bash
npx hardhat multisig <path to multisig vip relative to multisig/proposal> --network <network>
```

### Calculate the Safe TX hash and call data to execute a Multisig

Script to calculate the Safe TX hash associated with a multisig VIP, and the call data to execute it by the GUARDIAN wallet (defined in `src/multisig/utils.ts`). By default, the script will consider the next nonce of the Guardian wallet of the network. A custom nonce can be defined with the argument `nonce`.

It requires the address of the `MultiSend` and `MultiSendCallOnly` contracts, defined in `src/multisig/utils.ts` too.

```bash
npx hardhat safeTxData <path to multisig vip relative to multisig/proposal> [--nonce n] --network <network>
```

### Export Gnosis Safe tx JSON

Script to export a VIP in the form of a gnosis safe tx JSON format.

Before executing this script make sure that:

- The network you want to execute the multisig tx exist in `hardhat.config.ts` configuration, with the right `chainID`
- There is a `GUARDIAN` entry for the used network in `src/networkAddresses.ts`. This address will be the Gnosis safe wallet to be used

Proceed by executing the following command:

```bash
npx hardhat run scripts/createProposal.ts --network <networkName>
```

After executing the command, enter the needed information for the script.
Here is example input for exporting Multisig VIP 000 (`multisig/proposals/vip-000/vip-000-sepolia.ts`) into a JSON Gnosis Safe format:

```bash
npx hardhat run scripts/createProposal.ts --network sepolia
Number of the VIP to propose (if using gnosisTXBuilder press enter to skip ) => <blank>
Type of the proposal txBuilder/venusApp/bsc/gnosisTXBuilder => gnosisTXBuilder
Address of the governance contract (optional, press enter to skip) => <blank>
Multisig VIP ID (located at ./multisig/proposals/vip-{id}) to process => 000
```

The script should output a file `gnosisTXBuilder.json` that you can import in your Gnosis Safe UI.

### Generate Safe Multisig JSON (Pause / CF=0)

Interactive script that generates a Gnosis Safe TX Builder JSON for pause-action or set-collateral-factor-to-zero proposals.

Before running, ensure `ARCHIVE_NODE_<network>` is set in `.env` (needed to fetch markets and liquidation thresholds on-chain).

```bash
npx hardhat run scripts/generateSafePauseJson.ts --network <networkName>
```

For ZKsync, add the zksync hardhat config file in the --config flag when running the command.

```bash
npx hardhat run scripts/generateSafePauseJson.ts --network zksyncmainnet --config ./hardhat.config.zksync.ts
```

The script will prompt you to:

1. Confirm or override the comptroller address (pre-filled from `src/networkAddresses.ts`)
2. Load markets — fetch from comptroller, use `scripts/data/markets.json`, or enter manually
3. Select operation — pause actions, set collateral factor to 0, or both
4. If pausing, select which actions to pause (MINT, REDEEM, BORROW, REPAY, SEIZE, LIQUIDATE, TRANSFER, ENTER_MARKET, EXIT_MARKET)
5. If setting CF=0 on BSC mainnet, select whether to also include e-mode pools

**Output:**

- For BSC mainnet with "cf_zero" or "both": `safePauseTxBuilder_cf.json` is generated with CF=0 commands under the CRITICAL_GUARDIAN Safe. When "both" is selected, a separate `safePauseTxBuilder.json` with pause commands under the GUARDIAN Safe is also generated.
- For all other networks: a single `safePauseTxBuilder.json` containing all commands under the GUARDIAN Safe.

To simulate the generated JSON against a fork before submitting:

```bash
npx hardhat test scripts/simulateSafePauseTx.ts --fork <networkName>
```

For BSC mainnet CF=0 simulation, use the `TEST_CF` flag to pick the `_cf` file:

```bash
TEST_CF=true npx hardhat test scripts/simulateSafePauseTx.ts --fork bscmainnet
```

For zksync, add the zksync config file after the hardhat command like `--config ./hardhat.config.zksync.ts `

This impersonates the Safe address (GUARDIAN or CRITICAL_GUARDIAN) from the JSON and executes each transaction on a forked network, verifying they all succeed.

### Make proposal for multiple networks

Procedure to make vip:

For remote commands add one more field of `dstChainId` specifying layer zero chain id of desired remote chain for instance `dstChainId = 101` for Ethereum. Lz chain ids can be retrieve from `LzChainId` enum present in types.

### Simulations for multiple networks proposal

In .env update `ARCHIVE_NODE_<NETWORK_NAME>` with the URL of desired network.

Make different simulations for different networks. Use `testForkedNetworkVipCommands` to simulate remote proposal.

To run simulations use this command

```bash
npx hardhat test simulations/<simulation-path> --fork <network>
```

### Propose VIP

Procedure to propose VIP using tasks

```bash
npx hardhat propose <path to vip relative to vips> --network bscmainnet
```

For testnet

```bash
npx hardhat proposeOnTestnet <path to vip relative to vips> --network bsctestnet
```
