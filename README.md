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

### Execute Sepolia VIP (via Multisig)

Script to execute a VIP through the Gnosis Safe Multisig in Sepolia netowrk only

Procedure for Execute VIP on Sepolia

In .env, make sure that `DEPLOYER_PRIVATE_KEY` is the one of the multisig owner on sepolia  `0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C`

Proceed by executing the following command:
```
npx hardhat run scripts/executeVIPSepolia.ts --network sepolia
```

After executing the commant, provide the VIP number to be executed and press enter:
```
Number of the VIP to execute =>
```