# vip

### Prerequisites

- NodeJS - 16.x

- Solc - v0.8.13 (https://github.com/ethereum/solidity/releases/tag/v0.8.13)

### Installing

```

yarn install

```

### Run Simulations

```
npx hardhat test simulations/<simulation-path>
```

### Run Simulations for Multisig

```
npx hardhat test multisig/simulations/<network>/<path>
```

### Create Proposal

Script to generate proposal data for multiple destinations such as venusApp bscexplorer and gnosis tx builder.

Procedure for Creating a Proposal

```
npx hardhat run scripts/createProposal.ts

Enter the number of vip for which you require proposal data.
Select the type of destination, such as txBuilder/venusApp/bsc.
Enter the governor_proxy address or enter to select the default one.
```

### Propose vip

Script to build vip calldata and target.

Procedure for Propose vip

In .env, replace VIP_NUMBER with the number of vip to propose.

```
npx hardhat test scripts/proposeVIP.ts
```

### Make Proposal for multiple networks

Procedure to make vip

In .env `FORKED_NETWORK` must contain name of the network on which proposal needs to be executed.

Make sure to update `dstChainId` field with chain Id of desired network in commands.

### Simulations for multiple networks proposal

In .env update `ARCHIVE_NODE_<NETWORK_NAME>` with the URL of desired network.

Make different simulations for different networks.

To run simulations use this command

```
npx hardhat test simulations/<desired-network-simulations>.ts
```

### Execute VIP (via Multisig)

Script to execute a VIP through the Gnosis Safe Multisig

Procedure for executing VIP

In .env, make sure that `DEPLOYER_PRIVATE_KEY` is the one of the multisig owner on sepolia `0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C`

Proceed by executing the following command:

```
npx hardhat run scripts/executeMultiSigTx.ts --network sepolia
```

After executing the command, provide the proposal name to be executed and press enter:

```
Name of tx file (from ./multisig/<network>/ dir) to execute =>
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
