import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const BNB_AMOUNT = parseUnits("5", 18);

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const ARBITRUM_ACM_AGGREGATOR = "0x74AFeA28456a683b8fF907699Ff77138edef00f3";
export const OPBNBMAINNET_ACM_AGGREGATOR = "0x6dB5e303289fea2E83F7d442470210045592AD93";
export const ETHEREUM_ACM_AGGREGATOR = "0xb78772bed6995551b64e54Cdb8e09800d86C73ee";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip391 = () => {
  const meta = {
    version: "v2",
    title: "VIP-391 Multichain Governance - Permissions on Ethereum, Arbitrum one and opBNB",
    description: `#### Summary

If passed, following the Community proposal “[Venus Upgrade - Omnichain Money Markets](https://community.venus.io/t/venus-upgrade-omnichain-money-markets/3027/9)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1), this VIP will perform the following actions:

- Authorise timelock contracts (Governance) on Ethereum, Arbitrum one and opBNB to execute the same privilege functions they can execute on BNB Chain
- Revoke permissions for the Guardian wallets, to execute the privilege functions that will be authorised for the timelock contracts (Governance) in the previous step
- Transfer 5 BNB from the [Venus Treasury on BNB](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396) contract, to fund the cross-chain messages

After executing this VIP, no more Guardian transactions will be needed to execute most of the privilege commands on Ethereum, Arbitrum one and opBNB (Guardian will be only required for contract upgrades in those networks, and that will change soon too).

#### Details

This VIP will update the following number of permissions:

- Ethereum: grant 214 authorizations to Governance and revoke 67 authorizations for the Guardian wallet
- Arbitrum one: grant 190 authorizations to Governance and revoke 52 authorizations for the Guardian wallet
- opBNB: grant 140 authorizations to Governance and revoke 35 authorizations for the Guardian wallet

The numbers of permissions granted and revoked are different because there are different contracts deployed to each network (for example, on Ethereum there are more markets and therefore more contracts).

To apply these changes cross-chain, this VIP uses a new contract (ACMCommandsAggregator). Changes (grants and revokes) are pre-loaded in the ACMCommandsAggregator contracts and the VIP on BNB Chain only sends a message cross-chain to execute specific batches of changes. This reduces the payload sent cross-chain and therefore the gas cost of the VIP execution.

The specific pre-loaded permissions can be checked in here:

- Ethereum: grants ([here](https://etherscan.io/tx/0xaf04d459e828794df5749c99377541ef78b95aea3dfd6101bf0b35e42b76dd88) and [here](https://etherscan.io/tx/0x232a67df66650aeee8fa68e999725fe16e1f3c50a40ee1e75ca36add29f92ddf)) and [revokes](https://etherscan.io/tx/0xbe287e6e2ec8ab40cac11ac783a3675bbadefd1f294a95325bdbddef5319adcf)
- Arbitrum one: [grants](https://arbiscan.io/tx/0x52914e30e5e533d230cbec80d1321f515037a5d30beb07b8dccc7a8912a9e5be) and [revokes](https://arbiscan.io/tx/0x33a88d1f2764a771536a95d3718538092d22324b040db37446da8a32340be5fa)
- opBNB: [grants](https://opbnbscan.com/tx/0x15eefb0c0b4112175b971a41b051ecda2752c036f776b495514bafdffe6fc065) and [revokes](https://opbnbscan.com/tx/0xa0aae2a6fc6705f9b21a7ee9658c6bf2cdffba9c651201de42efdc3500d7be4d)

Out of scope in this VIP (to be addressed in the future with other VIP’s):

- Configuration of permissions for zkSync Era and Optimism. A VIP will be proposed soon to enable Multichain Governance first on these new networks, similar to VIP-330 and VIP-331
- Ownership of the contracts. The Guardian wallets will stay as the owner of the contracts on Ethereum, Arbitrum one, opBNB (and zkSync Era and Optimism). This ownership will be transferred to Governance (specifically to the Normal Timelock contract on each network) after a period confirming everything is working as expected with Multichain VIP’s

This VIP is a follow-up of these VIP’s:

- [VIP-330 Enable Multichain Governance (1/2)](https://app.venus.io/#/governance/proposal/330)
- [VIP-331 Enable Multichain Governance (2/2)](https://app.venus.io/#/governance/proposal/331)

Review these VIP’s for a detailed explanation of the Multichain Governance feature.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Multichain Governance contracts. Certik has audited the ACMCommandsAggregator contract.
- **VIP execution simulation**: in a simulation environment, validating the expected configuration on every network
- **Deployment on testnet**: the same contracts have been deployed to the supported testnets, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
- [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
- [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
- [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)
- [Certik audit report of ACMCommandsAggregator - 2024/10/07](https://github.com/VenusProtocol/governance-contracts/blob/3a5a2740e86c9137ab17f4f3939c97b145a22803/audits/118_ACMCommandsAggregator_certik_20241007.pdf)

#### Deployed contracts

Ethereum:

- Normal Timelock: [0xd969E79406c35E80750aAae061D402Aab9325714](https://etherscan.io/address/0xd969E79406c35E80750aAae061D402Aab9325714)
- FastTrack Timelock: [0x8764F50616B62a99A997876C2DEAaa04554C5B2E](https://etherscan.io/address/0x8764F50616B62a99A997876C2DEAaa04554C5B2E)
- Critical Timelock: [0xeB9b85342c34F65af734C7bd4a149c86c472bC00](https://etherscan.io/address/0xeB9b85342c34F65af734C7bd4a149c86c472bC00)
- ACMCommandsAggregator: [0xb78772bed6995551b64e54Cdb8e09800d86C73ee](https://etherscan.io/address/0xb78772bed6995551b64e54Cdb8e09800d86C73ee)
- ACM: [0x230058da2D23eb8836EC5DB7037ef7250c56E25E](https://etherscan.io/address/0x230058da2D23eb8836EC5DB7037ef7250c56E25E)

Arbitrum one:

- Normal Timelock: [0x4b94589Cc23F618687790036726f744D602c4017](https://arbiscan.io/address/0x4b94589Cc23F618687790036726f744D602c4017)
- Fasttrack Timelock: [0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04](https://arbiscan.io/address/0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04)
- Critical Timelock: [0x181E4f8F21D087bF02Ea2F64D5e550849FBca674](https://arbiscan.io/address/0x181E4f8F21D087bF02Ea2F64D5e550849FBca674)
- ACMCommandsAggregator: [0x74AFeA28456a683b8fF907699Ff77138edef00f3](https://arbiscan.io/address/0x74AFeA28456a683b8fF907699Ff77138edef00f3)
- ACM: [0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157](https://arbiscan.io/address/0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157)

opBNB:

- Normal Timelock: [0x10f504e939b912569Dca611851fDAC9E3Ef86819](https://opbnbscan.com/address/0x10f504e939b912569Dca611851fDAC9E3Ef86819)
- FastTrack Timelock: [0xEdD04Ecef0850e834833789576A1d435e7207C0d](https://opbnbscan.com/address/0xEdD04Ecef0850e834833789576A1d435e7207C0d)
- Critical Timelock: [0xA7DD2b15B24377296F11c702e758cd9141AB34AA](https://opbnbscan.com/address/0xA7DD2b15B24377296F11c702e758cd9141AB34AA)
- ACMCommandsAggregator: [0x6dB5e303289fea2E83F7d442470210045592AD93](https://opbnbscan.com/address/0x6dB5e303289fea2E83F7d442470210045592AD93)
- ACM: [0xA60Deae5344F1152426cA440fb6552eA0e3005D6](https://opbnbscan.com/address/0xA60Deae5344F1152426cA440fb6552eA0e3005D6)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/395/)
- [Set of permissions configured on each network](https://github.com/VenusProtocol/governance-contracts/pull/90)
- [Code of Multichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- [Documentation - Technical article with more details of the Multichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: ARBITRUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: ETHEREUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip391;
