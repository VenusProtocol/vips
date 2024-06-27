import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, arbitrumone } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";
const BSC_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
const BSC_FASTTRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const BSC_CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const BSC_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

const { ethereum, opbnbmainnet } = NETWORK_ADDRESSES;
export const ETHEREUM_NORMAL_TIMELOCK = "0xd969E79406c35E80750aAae061D402Aab9325714";
export const ETHEREUM_OMNICHAIN_EXECUTOR_OWNER = "0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba";
export const ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR = ethereum.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const OPBNBMAINNET_NORMAL_TIMELOCK = "0x10f504e939b912569Dca611851fDAC9E3Ef86819";
export const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xf7e4c81Cf4A03d52472a4d00c3d9Ef35aF127E45";
export const OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR = opbnbmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const MAX_DAILY_LIMIT = 100;

export const ARBITRUM_NORMAL_TIMELOCK = "0x4b94589Cc23F618687790036726f744D602c4017";
export const ARBITRUM_OMNICHAIN_EXECUTOR_OWNER = "0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD";
export const ARBITRUM_OMNICHAIN_GOVERNANCE_EXECUTOR = arbitrumone.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

const vip330 = () => {
  const meta = {
    version: "v2",
    title: "VIP-330 Enable Multichain Governance (1/2)",
    description: `### Summary

If passed, following the Community proposal “[Venus Upgrade - Omnichain Money Markets](https://community.venus.io/t/venus-upgrade-omnichain-money-markets/3027/9)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1), this VIP enables the Multichain Governance system on the Venus protocol. Multichain Governance will allow the Venus Community to propose VIP’s on BNB Chain including commands to be executed on the different networks: Ethereum, Arbitrum one and opBNB.

### Description

The Multichain Governance system is designed to facilitate the execution of VIP across multiple blockchain networks, integrating with the Access Control Manager (ACM) and LayerZero communication protocol. It extends the [governance model proposed by LayerZero](https://github.com/LayerZero-Labs/omnichain-governance-executor/tree/main).

### Key Features

1. **VIP Types and Delays**: provides three VIP options: Normal, Fast-track, and Critical.
2. **Inter-chain communication**: LayerZero provides secure and reliable cross-chain messaging for remote execution commands.
3. **Bridging**: works with a bridge solution to deliver messages to destination networks. Bridge configurations are flexible to accommodate various networks.
4. **Guardian account**: authorized by the AccessControlManager contract to revoke proposals before they are executed on the target network to prevent the execution of malicious proposals..
5. **Command limits and pausing**: allows Venus Community to establish daily command restrictions for destination networks. Adds pause/resume functionality for execution to temporarily halt operations in case of an emergency.

### Detailed breakdown

1. **Proposing and Voting**:
    * Proposers send VIPs with BNB Chain commands and remote commands.
    * Voting takes place on the BNB Chain utilising existing governance contracts.
    * Proposals are validated and approved according to predetermined criteria and threshold.
2. **Remote Execution Flow**:
    * Commands for destination networks generate a "Remote VIPs payload”
    * The payload is routed to the destination network using the bridge solution.
3. **Delay Mechanism**:
    * Remote execution has two delays: bridge delay and executor delay.
    * Bridge delay is the time it takes for the bridge to propagate a message to the target network, which is commonly measured in minutes.
    * Executor delay is the duration between the message's arrival on the target network and its execution, which is customizable dependent on VIP type (Normal, Fast-track, or Critical)
4. **Execution and Expiry**:
    * User-triggered execution occurs once both delays have passed, signaling the destination network's readiness to perform the orders via Timelock.
    * The Guardian account can cancel orders before they are executed, offering a safeguard against malicious or erroneous acts.
    * "Remote VIPs" become "Expired" if no execution happens within a set grace period, avoiding stale or outdated commands from being executed.
5. **Command Restrictions**:
    * VIPs can only include one set of commands per destination network to prevent duplication and conflicts.
    * Duplicate commands for the same network within a VIP are not permitted, ensuring consistent and reliable execution.
6. **Executor-Side Features**:
    * Sets a daily limit on the number of commands received per network.
    * Implements pause/resume functionality for the execute function in the target governance contract, enabling administrators to manage the system's operational state effectively.

### Commands on the this VIP

This VIP will grant permissions to Normal, Fast-track and Critical timelocks on BNB chain to create remote VIP’s. It also performs the necessary configuration of OmnichainProposalSender on BNB Chain and OmnichainProposalExecutor on Ethereum, Arbitrum one and opBNB (set the trustworthiness relationships, configure limits, accept ownerships).

Moreover, this VIP will authorise the Guardian wallets on [Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0) and [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207) to execute the privilege commands on the OmnichainExecutorOwner contracts. This is a safety measure, to guarantee it will be possible to execute remote VIP’s. These permissions will be removed in the future. These authorizations will be granted with multisig transactions ([this](https://app.safe.global/transactions/tx?id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xd123cbfe4ef53d4ca8b9ffd9ce7f320c61c8232bc450755df15ac32aa8946f7c&safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67), [this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x2964953abc75f89a4dd954b491190d4f6291907e7fb95eafad3b0f49e7815886&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) and [this](https://multisig.bnbchain.org/transactions/tx?id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x73d1cbdbf6b5c676c718e5b6546ff56081ead444b42f56ed043a3bb86f816660&safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), that will be executed only if this VIP passes. Otherwise, they will be rejected.

### Next steps

New VIP’s will be proposed in the following weeks to complete the configuration

* Grant permission to Fast-track and Critical timelocks to execute privilege commands on the OmnichainProposalExecutor on Ethereum, Arbitrum one and opBNB
* Authorise Normal, Fast-track and Critical timelocks to execute the different privilege commands on the destination networks
* Reduce the permissions granted to the Guardian wallets on the destination networks (nowadays, the Guardian wallets can execute any privilege command on those networks)
* Transfer the ownership of the contracts, from the Guardian wallets to the Normal timelocks on each destination network
* Synchronise the voting power. With this feature, the XVS staked on the different networks will be taken into account during the VIP’s votes on BNB Chain

### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Audits: **[OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Multichain Governance contracts.
* **VIP execution simulation**: in a simulation environment, validating the expected configuration on every network
* **Deployment on testnet**: the same contracts have been deployed to the supported testnets, and used in the Venus Protocol testnet deployment

### Audit reports

* [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
* [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
* [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
* [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)

### Deployed contracts

Mainnet:

* BNB Chain:
    * OmniChainProposalSender: [0x36a69dE601381be7b0DcAc5D5dD058825505F8f6](https://bscscan.com/address/0x36a69dE601381be7b0DcAc5D5dD058825505F8f6)
* Ethereum:
    * Normal Timelock: [0xd969E79406c35E80750aAae061D402Aab9325714](https://etherscan.io/address/0xd969E79406c35E80750aAae061D402Aab9325714)
    * FastTrack Timelock:  [0x8764F50616B62a99A997876C2DEAaa04554C5B2E](https://etherscan.io/address/0x8764F50616B62a99A997876C2DEAaa04554C5B2E)     
    * Critical Timelock:  [0xeB9b85342c34F65af734C7bd4a149c86c472bC00](https://etherscan.io/address/0xeB9b85342c34F65af734C7bd4a149c86c472bC00)     
    * Omnichain Governance Executor:  [0xd70ffB56E4763078b8B814C0B48938F35D83bE0C](https://etherscan.io/address/0xd70ffB56E4763078b8B814C0B48938F35D83bE0C)     
    * Omnichain Executor Owner Proxy:  [0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba](https://etherscan.io/address/0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba)     
* Arbitrum one:
    * Normal Timelock:  [0x4b94589Cc23F618687790036726f744D602c4017](https://arbiscan.io/address/0x4b94589Cc23F618687790036726f744D602c4017)        
    * Fasttrack Timelock: [0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04](https://arbiscan.io/address/0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04)        
    * Critical Timelock: [0x181E4f8F21D087bF02Ea2F64D5e550849FBca674](https://arbiscan.io/address/0x181E4f8F21D087bF02Ea2F64D5e550849FBca674)        
    * Omnichain Governance Executor:     [0xc1858cCE6c28295Efd3eE742795bDa316D7c7526](https://arbiscan.io/address/0xc1858cCE6c28295Efd3eE742795bDa316D7c7526)        
    * Omnichain Executor Owner Proxy:     [0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD](https://arbiscan.io/address/0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD)        
* opBNB:
    * Normal Timelock: [0x10f504e939b912569Dca611851fDAC9E3Ef86819](https://opbnbscan.com/address/0x10f504e939b912569Dca611851fDAC9E3Ef86819)        
    * FastTrack Timelock: [0xEdD04Ecef0850e834833789576A1d435e7207C0d](https://opbnbscan.com/address/0xEdD04Ecef0850e834833789576A1d435e7207C0d)        
    * Critical Timelock: [0xA7DD2b15B24377296F11c702e758cd9141AB34AA](https://opbnbscan.com/address/0xA7DD2b15B24377296F11c702e758cd9141AB34AA)        
    * Omnichain Governance Executor:     [0x82598878Adc43F1013A27484E61ad663c5d50A03](https://opbnbscan.com/address/0x82598878Adc43F1013A27484E61ad663c5d50A03)        
    * Omnichain Executor owner proxy:     [0xf7e4c81Cf4A03d52472a4d00c3d9Ef35aF127E45](https://opbnbscan.com/address/0xf7e4c81Cf4A03d52472a4d00c3d9Ef35aF127E45)        

Testnets:

* BNB Chain:
    * Omnichain Proposal Sender:    [0xCfD34AEB46b1CB4779c945854d405E91D27A1899](https://testnet.bscscan.com/address/0xCfD34AEB46b1CB4779c945854d405E91D27A1899)        
* Sepolia: 
    * Normal Timelock: [0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF](https://sepolia.etherscan.io/address/0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF)        
    * FastTrack Timelock: [0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182](https://sepolia.etherscan.io/address/0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182)        
    * Critical Timelock: [0xA24A7A65b8968a749841988Bd7d05F6a94329fDe](https://sepolia.etherscan.io/address/0xA24A7A65b8968a749841988Bd7d05F6a94329fDe)        
    * Omnichain Governance Executor:     [0xD9B18a43Ee9964061c1A1925Aa907462F0249109](https://sepolia.etherscan.io/address/0xD9B18a43Ee9964061c1A1925Aa907462F0249109)        
    * Omnichain Executor Owner Proxy:     [0xf964158C67439D01e5f17F0A3F39DfF46823F27A](https://sepolia.etherscan.io/address/0xf964158C67439D01e5f17F0A3F39DfF46823F27A)        
* Arbitrum sepolia:
    * Normal Timelock: [0x794BCA78E606f3a462C31e5Aba98653Efc1322F8](https://sepolia.arbiscan.io/address/0x794BCA78E606f3a462C31e5Aba98653Efc1322F8)        
    * Fasttrack Timelock: [0x14642991184F989F45505585Da52ca6A6a7dD4c8](https://sepolia.arbiscan.io/address/0x14642991184F989F45505585Da52ca6A6a7dD4c8)        
    * Critical Timelock: [0x0b32Be083f7041608E023007e7802430396a2123](https://sepolia.arbiscan.io/address/0x0b32Be083f7041608E023007e7802430396a2123)        
    * Omnichain Governance Executor:     [0xcf3e6972a8e9c53D33b642a2592938944956f138](https://sepolia.arbiscan.io/address/0xcf3e6972a8e9c53D33b642a2592938944956f138)        
    * Omnichain Executor Owner Proxy :     [0xfCA70dd553b7dF6eB8F813CFEA6a9DD039448878](https://sepolia.arbiscan.io/address/0xfCA70dd553b7dF6eB8F813CFEA6a9DD039448878)               
* opBNB:
    * Normal Timelock: [0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120](https://testnet.opbnbscan.com/address/0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120)        
    * FastTrack Timelock: [0xB2E6268085E75817669479b22c73C2AfEaADF7A6](https://testnet.opbnbscan.com/address/0xB2E6268085E75817669479b22c73C2AfEaADF7A6)        
    * Critical Timelock: [0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3](https://testnet.opbnbscan.com/address/0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3)        
    * Omnichain Governance Executor:     [0x0aa644c4408268E9fED5089A113470B6e706bc0C](https://testnet.opbnbscan.com/address/0x0aa644c4408268E9fED5089A113470B6e706bc0C)        
    * Omnichain Executor Owner Proxy:     [0x4F570240FF6265Fbb1C79cE824De6408F1948913](https://testnet.opbnbscan.com/address/0x4F570240FF6265Fbb1C79cE824De6408F1948913)   

### References

* [VIP simulation](https://github.com/VenusProtocol/vips/pull/126)
* [Code of Multichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
* [Documentation - Technical article with more details of the Multichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "removeTrustedRemote(uint16)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          BSC_FASTTRACK_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "removeTrustedRemote(uint16)", BSC_FASTTRACK_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes,address)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OMNICHAIN_PROPOSAL_SENDER,
          "retryExecute(uint256,uint16,bytes,bytes,address,uint256)",
          BSC_CRITICAL_TIMELOCK,
        ],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setSendVersion(uint16)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setConfig(uint16,uint16,uint256,bytes)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "removeTrustedRemote(uint16)", BSC_CRITICAL_TIMELOCK],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "retryExecute(uint256,uint16,bytes,bytes,address,uint256)", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "pause()", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "unpause()", BSC_GUARDIAN],
      },
      {
        target: BSC_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "removeTrustedRemote(uint16)", BSC_GUARDIAN],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ETHEREUM_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ETHEREUM_CHAIN_ID, ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [OPBNBMAINNET_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [OPBNBMAINNET_CHAIN_ID, OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ARBITRUM_CHAIN_ID, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ARBITRUM_CHAIN_ID, ARBITRUM_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      {
        target: ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setSrcChainId(uint16)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "transferBridgeOwnership(address)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ETHEREUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ETHEREUM_NORMAL_TIMELOCK,
        ],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ETHEREUM_NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setSrcChainId(uint16)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "transferBridgeOwnership(address)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "pause()", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setMinDstGas(uint16,uint16,uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setPayloadSizeLimit(uint16,uint256)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setConfig(uint16,uint16,uint256,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTrustedRemoteAddress(uint16,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "setTimelockPendingAdmin(address,uint8)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          OPBNBMAINNET_NORMAL_TIMELOCK,
        ],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", OPBNBMAINNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setSrcChainId(uint16)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "transferBridgeOwnership(address)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint256)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setTimelockPendingAdmin(address,uint8)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "retryMessage(uint16,bytes,uint64,bytes)",
          ARBITRUM_NORMAL_TIMELOCK,
        ],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setGuardian(address)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip330;
