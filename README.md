# vip

### Prerequisites

- NodeJS - 16.x

- Solc - v0.8.13 (https://github.com/ethereum/solidity/releases/tag/v0.8.13)

### Installing

```

yarn install

```

### Repo structure

The simulations and create commands require the function creating the VIP to be the default export.

### Run Simulations

```
npx hardhat test simulations/<simulation-path> --fork <network>
```

### Run Simulations for Multisig

Simulations for multisig transactions can be run individually or sequentially. Running test for proposals can be done by passing in the index file of the network's simulation dir where each proposal test is imported.

```
npx hardhat test multisig/simulations/<path> --fork <network>
```

### Create Proposal

Script to generate proposal data for multiple destinations such as venusApp bscexplorer and gnosis tx builder.

Procedure for Creating a Proposal

```
npx hardhat createProposal --network <networkName>

Enter the number of vip for which you require proposal data.
Select the type of destination, such as txBuilder/venusApp/bsc.
Enter the governor_proxy address or enter to select the default one.
```

### Propose vip

Script to build vip calldata and target.

Procedure for Propose vip

```
npx hardhat run scripts/proposeVIP.ts
```

### Execute VIP (via Multisig)

Script to execute a VIP through the Gnosis Safe Multisig

Procedure for executing VIP

In .env, make sure that `DEPLOYER_PRIVATE_KEY` is the one of the multisig owner on the network (e.g. `0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C` on sepolia)

Proceed by executing the following command:

```
npx hardhat multisig <path to multisig vip relative to multisig/proposal> --network <network>
```

### Calculate the Safe TX hash and call data to execute a Multisig

Script to calculate the Safe TX hash associated with a multisig VIP, and the call data to execute it by the GUARDIAN wallet (defined in `src/multisig/utils.ts`). By default, the script will consider the next nonce of the Guardian wallet of the network. A custom nonce can be defined with the argument `nonce`.

It requires the address of the `MultiSend` and `MultiSendCallOnly` contracts, defined in `src/multisig/utils.ts` too.

```
npx hardhat safeTxData <path to multisig vip relative to multisig/proposal> [--nonce n] --network <network>
```

### Export Gnosis Safe tx JSON

Script to export a VIP in the form of a gnosis safe tx JSON format.

Before executing this script make sure that:

- The network you want to execute the multisig tx exist in `hardhat.config.ts` configuration, with the right `chainID`
- There is a `GUARDIAN` entry for the used network in `src/networkAddresses.ts`. This address will be the Gnosis safe wallet to be used

Proceed by executing the following command:

```
npx hardhat run scripts/createProposal.ts --network <networkName>
```

After executing the command, enter the needed information for the script.
Here is example input for exporting Multisig VIP 000 (`multisig/proposals/vip-000/vip-000-sepolia.ts`) into a JSON Gnosis Safe format:

```
npx hardhat run scripts/createProposal.ts --network sepolia
Number of the VIP to propose (if using gnosisTXBuilder press enter to skip ) => <blank>
Type of the proposal txBuilder/venusApp/bsc/gnosisTXBuilder => gnosisTXBuilder
Address of the governance contract (optional, press enter to skip) => <blank>
Multisig VIP ID (located at ./multisig/proposals/vip-{id}) to process => 000
```

The script should output a file `gnosisTXBuilder.json` that you can import in your Gnosis Safe UI.

### Make proposal for multiple networks

Procedure to make vip:

For remote commands add one more field of `dstChainId` specifying layer zero chain id of desired remote chain for instance `dstChainId = 101` for Ethereum. Lz chain ids can be retrieve from `LzChainId` enum present in types.

### Simulations for multiple networks proposal

In .env update `ARCHIVE_NODE_<NETWORK_NAME>` with the URL of desired network.

Make different simulations for different networks. Use `testForkedNetworkVipCommands` to simulate remote proposal.

To run simulations use this command

```
npx hardhat test simulations/<simulation-path> --fork <network>
```

### Propose VIP

Procedure to propose VIP using tasks

```
npx hardhat propose <path to vip relative to vips> --network bscmainnet
```

For testnet

```
npx hardhat proposeOnTestnet <path to vip relative to vips> --network bsctestnet
```
