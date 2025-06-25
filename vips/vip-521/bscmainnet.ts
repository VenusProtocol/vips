import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, unichainmainnet, arbitrumone, opmainnet, basemainnet, opbnbmainnet, zksyncmainnet } =
  NETWORK_ADDRESSES;

export const ERC4626_FACTORY_BNB = "0xC2f7924809830886EB04c6b40725Fd68F1891fA2";
export const ERC4626_FACTORY_ARBITRUM = "0xC1422B928cb6FC9BA52880892078578a93aa5Cc7";
export const ERC4626_FACTORY_OPTIMISM = "0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F";
export const ERC4626_FACTORY_BASE = "0x1A430825B31DdA074751D6731Ce7Dca38D012D13";
export const ERC4626_FACTORY_ETHEREUM = "0x39cb747453Be3416E659dAeA169540b6F000c885";
export const ERC4626_FACTORY_UNICHAIN = "0x102fEb723C25c67dbdfDccCa3B1c1a6e1a662D2f";
export const ERC4626_FACTORY_ZKSYNC = "0xDC59Dd76Dd7A64d743C764a9aa8C96Ff2Ea8BAc3";
export const ERC4626_FACTORY_OPBNB = "0x89A5Ce0A6db7e66E53F148B50D879b700dEB81C8";

export const PSR_BNB = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PSR_ETHEREUM = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const PSR_OPBNB = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";
export const PSR_BASE = "0x3565001d57c91062367C3792B74458e3c6eD910a";
export const PSR_ARBITRUM = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const PSR_OPTIMISM = "0x735ed037cB0dAcf90B133370C33C08764f88140a";
export const PSR_UNICHAIN = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";
export const PSR_ZKSYNC = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";

export const PSR_BNB_NEW_IMPLEMENTATION = "0xDF41C4201b06EE344C5A3F6E20E41b4b900C90BD";
export const PSR_ETHEREUM_NEW_IMPLEMENTATION = "0xfD6Ef8B67f82a0ddA8E078954E04B749a75cE326";
export const PSR_OPBNB_NEW_IMPLEMENTATION = "0x85B0711FB5Bef4CfeDb90BD2F392b943fd9f556D";
export const PSR_BASE_NEW_IMPLEMENTATION = "0x74487c1cBDa7f1Abc0d4d8652941e41CCc0F6c0E";
export const PSR_ARBITRUM_NEW_IMPLEMENTATION = "0xFde46857B36881d69F742D44Aa5bF81e8f8dcF94";
export const PSR_OPTIMISM_NEW_IMPLEMENTATION = "0x72672A4f9d2EF78eC98cF8Fd4b3544beBC3fea9E";
export const PSR_UNICHAIN_NEW_IMPLEMENTATION = "0x2167f65B4012300673A19AB669A8278D6A5fbDf3";
export const PSR_ZKSYNC_NEW_IMPLEMENTATION = "0xf60d4c96E1bF0FC865753aB7BF438C88444Fa971";

export const ACM_BNB = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const ACM_ETHEREUM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ACM_OPBNB = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ACM_BASE = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const ACM_ARBITRUM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ACM_OPTIMISM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ACM_UNICHAIN = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const ACM_ZKSYNC = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

export const PROXY_ADMIN_BNB = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PROXY_ADMIN_BASE = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const PROXY_ADMIN_ARBITRUM = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const PROXY_ADMIN_ETHEREUM = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
export const PROXY_ADMIN_OPBNB = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";
export const PROXY_ADMIN_OPTIMISM = "0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2";
export const PROXY_ADMIN_UNICHAIN = "0x78e9fff2ab8daAB8559070d897C399E5e1C5074c";
export const PROXY_ADMIN_ZKSYNC = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";

export const vip521 = () => {
  const meta = {
    version: "v2",
    title: "VIP-521 Venus ERC-4626 Vaults",
    description: `#### Summary

If passed, following the community proposal "[[VRC] Venus ERC-4626 Vaults](https://community.venus.io/t/vrc-venus-erc-4626-vaults/5151)" ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xd9f0b28bf88b9685e1d9e8b09f8e1804846113502033d88a6911e0495666fdf8)), this VIP will enable the Factory contracts that allow anyone (permissionlessly) to deploy fully compatible [ERC-4626 vaults](https://ethereum.org/en/developers/docs/standards/tokens/erc-4626/) for the Venus markets: there will be one ERC-4626 vault for each Venus market. Users and third-party projects will be able to deposit and withdraw tokens supported by Venus into these vaults using a standardized interface. Under the hood, these tokens will be deposited into the associated VTokens, accruing interests allocated to the users.

The Venus ERC-4626 Vaults will be available on every network supported by Venus: BNB Chain, Ethereum, Arbitrum one, Optimism, ZKSync Era, Base, Unichain and opBNB. Support for the VTokens of the Core pool on BNB Chain will be added soon.

#### Description

Venus Protocol introduces **native ERC-4626 Vaults**, bringing standardized, composable yield vaults to the Venus ecosystem. This integration represents a significant advancement in making Venus's yield-bearing markets more accessible and composable within the broader DeFi ecosystem.

**Key Benefits**

- Full ERC-4626 Compliance – Interoperable with DeFi primitives (DAOs, aggregators, etc.)
- Native Venus Yield Integration – Auto-compounding via [VTokens](https://docs-v4.venus.io/technical-reference/reference-isolated-pools/vtoken/vtoken#vtoken)
- Gas-Optimized Architecture – [Beacon proxy pattern](https://docs.openzeppelin.com/contracts/4.x/api/proxy#beacon) for efficient deployments, so all vaults share the same implementation contract
- Secure & Upgradeable – Governance-controlled upgrades and reward management

**Business Case - Market Opportunity**

Standardised yield vaults are quickly becoming the default on‑ramp for both retail strategies and institutional wrappers (e.g. Ondo, Mountain, Superform). ERC‑4626 compliance is a prerequisite for aggregator listings, CEX structured‑product wrappers, and real‑world‑asset tokenisers.

Protocols that exposed ERC‑4626 vaults early captured **+95 % TVL growth in <30 days** after launch

**Business Case - Strategic Fit for Venus**

*Composability moat*: ERC‑4626 turns every VToken into an instantly whitelisted collateral primitive for dozens of front‑ends, abstractions and risk frameworks. This neutral interface lowers integration overhead from ~3 weeks custom dev ➞ 1 day of config.

*Network flywheel*: Vault TVL drives incremental interest spread, boosts Protocol Share Reserve inflows, and increases XVS buy‑and‑burn pressure—reinforcing existing token‑economic programmes (e.g. Borrow‑n‑Burn).

*Multi‑chain scale*: Because ERC‑4626 vaults are chain‑agnostic, liquidity routed to Venus on Base or Arbitrum can be marketed identically to liquidity on BNB Chain, letting us scale without fragmenting documentation or SDKs.

#### Understanding ERC-4626

[ERC-4626](https://ethereum.org/en/developers/docs/standards/tokens/erc-4626/) is a tokenized vault standard designed to unify how yield-bearing assets are deposited, managed, and withdrawn in DeFi protocols. It builds on the ERC-20 token standard and introduces a consistent interface for vaults that accept a specific asset (like USDC) and issue shares representing ownership in the vault.

The primary goal of ERC-4626 is **standardization**—allowing developers to integrate with vaults without needing to understand their internal mechanics. Functions like deposit, withdraw, mint, and redeem, follow predictable behaviors across all compliant contracts.

In essence, ERC-4626 makes it easier for users to earn yield on their assets and for protocols to plug into vaults in a reliable, composable way—enhancing both usability and interoperability across the DeFi ecosystem.

#### Technical Details

The implementation of the Venus ERC-4626 vaults consists of two core smart contracts:

1. VenusERC4626Factory.sol - The factory contract for deploying standardized vaults

- Deploys individual vaults for individual VTokens via BeaconProxy
- Ensures deterministic addresses using [CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- Managed by Venus Governance
- Vault Tracking: Maintains a mapping of VTokens to their corresponding deployed ERC-4626 vaults
- Reward Routing: Allows configuration of a centralized reward recipient for all vaults and supports liquidity mining incentives.

2. VenusERC4626.sol - The vault logic implementing ERC-4626 functionality

- ERC-4626-compliant mint, deposit, redeem, and withdraw functions
- Integrates with Venus VToken interest accrual
- Handles reward distribution (e.g., XVS)

Rewards accrued by the funds that the ERC-4626 Vaults will deposit into the Venus markets, will be transferred to the Protocol Share Reserve contracts on each network. These rewards will be considered "Additional Revenue", and distributed following the [Venus Tokenomics](https://docs-v4.venus.io/governance/tokenomics#allocation-for-additional-revenue-streams).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), [Pessimistic](https://pessimistic.io/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the ownership of the Factory contracts and the expected configuration
- **Deployment on testnet**: the same commands have been executed on every testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/1faa46139aaec06e0eb2e48341bff22cd6c38c6c/audits/129_erc4626_certik_20250514.pdf) (2025/05/14)
- [Pessimistic](https://github.com/VenusProtocol/isolated-pools/blob/1faa46139aaec06e0eb2e48341bff22cd6c38c6c/audits/131_erc4626_pessimistic_20250502.pdf) (2025/05/02)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/1faa46139aaec06e0eb2e48341bff22cd6c38c6c/audits/130_erc4626_fairyproof_20250414.pdf) (2025/04/14)

#### Deployed contracts

Factories on Mainnets

- [BNB Chain](https://bscscan.com/address/0xC2f7924809830886EB04c6b40725Fd68F1891fA2)
- [Ethereum](https://etherscan.io/address/0x39cb747453Be3416E659dAeA169540b6F000c885)
- [Arbitrum one](https://arbiscan.io/address/0xC1422B928cb6FC9BA52880892078578a93aa5Cc7)
- [Optimism](https://optimistic.etherscan.io/address/0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F)
- [ZKSync Era](https://explorer.zksync.io/address/0xDC59Dd76Dd7A64d743C764a9aa8C96Ff2Ea8BAc3)
- [Base](https://basescan.org/address/0x1A430825B31DdA074751D6731Ce7Dca38D012D13)
- [Unichain](https://uniscan.xyz/address/0x102fEb723C25c67dbdfDccCa3B1c1a6e1a662D2f)
- [opBNB](https://opbnbscan.com/address/0x89A5Ce0A6db7e66E53F148B50D879b700dEB81C8)

Factories on Testnets

- [BNB Chain](https://testnet.bscscan.com/address/0x07fcd489aef6a3EEAA9e8adE4361Fe5CC5BF30f7)
- [Ethereum (sepolia)](https://sepolia.etherscan.io/address/0xbf76e9429BA565220d77831A9eC3606434e2106e)
- [Arbitrum one](https://sepolia.arbiscan.io/address/0xC6C8249a0B44973673f3Af673e530B85038a0480)
- [Optimism](https://sepolia-optimism.etherscan.io/address/0xc66c4058A8524253C22a9461Df6769CE09F7d61e)
- [ZKSync Era](https://sepolia.explorer.zksync.io/address/0xa30dcc21B8393A4031cD6364829CDfE2b6D7B283)
- [Base](https://sepolia.basescan.org/address/0xD13c5527d1a2a8c2cC9c9eb260AC4D9D811a02a4)
- [Unichain](https://sepolia.uniscan.xyz/address/0x1365820B9ba3B1b5601208437a5A24192a12C1fB)
- [opBNB](https://testnet.opbnbscan.com/address/0x3dEDBD90EFC6E2257887FF36842337dF0739B8A1)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/559)
- [Codebase of the Venus ERC 4626 vaults](https://github.com/VenusProtocol/isolated-pools/pull/497)
- Testnet executions of the VIP
    - [BNB Chain testnet](https://testnet.bscscan.com/tx/0x2d3bedeeaee6454bac24954d4ae3a80feeb8d7bc20d95ff1956f2c84ab84c0ab)
    - [Base sepolia](https://sepolia.basescan.org/tx/0xd279164df6418a66530c5e512d37056d3054e4fd662cac09ad5cf860f551a7e8)
    - [ZKSync sepolia](https://sepolia.explorer.zksync.io/tx/0x73e496cc83e9368df97b060ec956fa5e6aaea3243df537f376ec6b45dec0e216)
    - [Unichain sepolia](https://sepolia.uniscan.xyz/tx/0x5bb1c134d43d156f311927fd268ac24725cadd4aecdeffd473cfe424ac333eac)
    - [Sepolia](https://sepolia.etherscan.io/tx/0xf3b45441af951dd65661cc4155772a2fe977563dd97bf64eb5e79260c264dd8b)
    - [opBNB testnet](https://testnet.opbnbscan.com/tx/0x3049117cc4f661d289a6cd5a62d51f167108521f070e28eb7611a2020be4e46e)
    - [Arbitrum one sepolia](https://sepolia.arbiscan.io/tx/0x165a6611b867f66bf3ee917a977ad82e6185fe1e9534a950cc8aebf48cce9e46)
    - [Optimism sepolia](https://sepolia-optimism.etherscan.io/tx/0x6b75317d84719318658bbe747884cd5c9667ae318a15d75a4f73532797544236)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // bscmainnet
      {
        target: ERC4626_FACTORY_BNB,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setRewardRecipient(address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setMaxLoopsLimit(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ERC4626_FACTORY_BNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_BNB],
      },
      {
        target: PROXY_ADMIN_BNB,
        signature: "upgrade(address,address)",
        params: [PSR_BNB, PSR_BNB_NEW_IMPLEMENTATION],
      },
      // arbitrumone
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setRewardRecipient(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setMaxLoopsLimit(uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "setRewardRecipient(address)",
        params: [PSR_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [PSR_ARBITRUM, PSR_ARBITRUM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.arbitrumone,
      },
      // opmainnet
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setRewardRecipient(address)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setMaxLoopsLimit(uint256)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPTIMISM],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: PROXY_ADMIN_OPTIMISM,
        signature: "upgrade(address,address)",
        params: [PSR_OPTIMISM, PSR_OPTIMISM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opmainnet,
      },
      // basemainnet
      {
        target: ERC4626_FACTORY_BASE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setRewardRecipient(address)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setMaxLoopsLimit(uint256)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ERC4626_FACTORY_BASE,
        signature: "setRewardRecipient(address)",
        params: [PSR_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [PSR_BASE, PSR_BASE_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.basemainnet,
      },
      // ethereum
      {
        target: ERC4626_FACTORY_ETHEREUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ETHEREUM, "setRewardRecipient(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ETHEREUM, "setMaxLoopsLimit(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ERC4626_FACTORY_ETHEREUM,
        signature: "setRewardRecipient(address)",
        params: [PSR_ETHEREUM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PROXY_ADMIN_ETHEREUM,
        signature: "upgrade(address,address)",
        params: [PSR_ETHEREUM, PSR_ETHEREUM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      // unichainmainnet
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setRewardRecipient(address)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setMaxLoopsLimit(uint256)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "setRewardRecipient(address)",
        params: [PSR_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [PSR_UNICHAIN, PSR_UNICHAIN_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.unichainmainnet,
      },
      // zksyncmainnet
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setRewardRecipient(address)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setMaxLoopsLimit(uint256)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "setRewardRecipient(address)",
        params: [PSR_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [PSR_ZKSYNC, PSR_ZKSYNC_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.zksyncmainnet,
      },
      // opbnbmainnet
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setRewardRecipient(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setMaxLoopsLimit(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: PROXY_ADMIN_OPBNB,
        signature: "upgrade(address,address)",
        params: [PSR_OPBNB, PSR_OPBNB_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip521;
