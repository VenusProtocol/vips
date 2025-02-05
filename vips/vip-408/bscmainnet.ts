import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { basemainnet, bscmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

export const OMNICHAIN_EXECUTOR_OWNER = "0x8BA591f72a90fb379b9a82087b190d51b226F0a9";
export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06";
export const MAX_DAILY_LIMIT = 100;
export const VENUS_STARS_TREASURY = "0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_AMOUNT = parseUnits("19938.50", 18);

const vip408 = () => {
  const meta = {
    version: "v2",
    title: "VIP-408 [Base] Markets, Prime and Omnichain Governance",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure the Venus markets on Base, for [cbBTC](https://basescan.org/address/0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf), [WETH](https://basescan.org/address/0x4200000000000000000000000000000000000006) and [USDC](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)
- Configure the [ProtocolShareReserve](https://basescan.org/address/0x3565001d57c91062367C3792B74458e3c6eD910a) contract on Base
- Configure the [NativeTokenGateway](https://basescan.org/address/0x8e890ca3829c740895cdEACd4a3BE36ff9343643) contact for the Venus market of WETH, accepting deposits and withdrawals of ETH
- Configure the [Prime](https://basescan.org/address/0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30) contract on Base, allowing users to stake XVS into the XVSVault to start their qualification period
- Enable the Omnichain Governance system on the Venus protocol, for Base. Omnichain Governance will allow the Venus Community to propose VIP’s on BNB Chain including commands to be executed on Base

#### Description

Following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-on-base/4630/13), if passed, this VIP will enable the following Venus markets on Base:

Underlying token: [cbBTC](https://basescan.org/address/0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf)

- Borrow cap: 200
- Supply cap: 400
- Collateral factor: 0.73
- Liquidation threshold: 0.78
- Reserve factor: 0.2
- Bootstrap liquidity: 0.05 cbBTC - provided by the Venus Treasury
- Interest rate curve:
    - kink: 0.45
    - base (yearly): 0
    - multiplier (yearly): 0.15
    - jump multiplier (yearly): 2.5

Underlying token: [WETH](https://basescan.org/address/0x4200000000000000000000000000000000000006)

- Borrow cap: 9,000
- Supply cap: 10,000
- Collateral factor: 0.8
- Liquidation threshold: 0.83
- Reserve factor: 0.15
- Bootstrap liquidity: 2 WETH - provided by the Venus Treasury
- Interest rate curve:
    - kink: 0.9
    - base (yearly): 0
    - multiplier (yearly): 0.03
    - jump multiplier (yearly): 4.5

Underlying token: [USDC](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)

- Borrow cap: 27,000,000
- Supply cap: 30,000,000
- Collateral factor: 0.75
- Liquidation threshold: 0.78
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDC - provided by the Venus Treasury
- Interest rate curve:
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.08
    - jump multiplier (yearly): 2.5

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 10%

Regarding the bootstrap liquidity for the new markets, this VIP will refund 0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D with $19,938.50 USDT on BNB Chain, to compensate the provision for [USDC](https://basescan.org/tx/0x84117a3a66a63ba784c07a096b51901eeb7bb0b0ba38f686ad1ab591218730c3), [cbBTC](https://basescan.org/tx/0x7e3021c203b8430d014e678094c59b4e3f7e00966cb241e1c684080c56bcba2c) and [WETH](https://basescan.org/tx/0x4d6fde66b30be733f643a3bebe60b102833160397bbfdeec1de1cdbcbf617c71) on Base and ETH on BNB Chain.

This VIP will grant permissions to Normal, Fast-track and Critical timelocks on BNB chain to create remote VIP’s on Base. It also performs the necessary configuration of OmnichainProposalSender on BNB Chain and OmnichainProposalExecutor on Base (set the trustworthiness relationships, configure limits, accept ownerships).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking ownership of the contracts and validating the usual operations on the markets
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:** [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://fairyproof.com/) have audited the code specific for Base. [OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Omnichain Governance contracts.

#### Audit reports

- Time base contracts:
    - [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
    - [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
    - [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)
- Omnichain Governance:
    - [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
    - [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
    - [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
    - [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)
    - [Certik audit report of ACMCommandsAggregator - 2024/10/07](https://github.com/VenusProtocol/governance-contracts/blob/3a5a2740e86c9137ab17f4f3939c97b145a22803/audits/118_ACMCommandsAggregator_certik_20241007.pdf)

#### Deployed contracts on Base

- Pool registry: [0xeef902918DdeCD773D4B422aa1C6e1673EB9136F](https://basescan.org/address/0xeef902918DdeCD773D4B422aa1C6e1673EB9136F)
- Comptroller: [0x0C7973F9598AA62f9e03B94E92C967fD5437426C](https://basescan.org/address/0x0C7973F9598AA62f9e03B94E92C967fD5437426C)
- Markets:
    - vcbBTC_Core: [0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72](https://basescan.org/address/0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72)
    - vWETH_Core: [0xEB8A79bD44cF4500943bf94a2b4434c95C008599](https://basescan.org/address/0xEB8A79bD44cF4500943bf94a2b4434c95C008599)
    - vUSDC_Core: [0x3cb752d175740043Ec463673094e06ACDa2F9a2e](https://basescan.org/address/0x3cb752d175740043Ec463673094e06ACDa2F9a2e)
- [ProtocolShareReserve](https://basescan.org/address/0x3565001d57c91062367C3792B74458e3c6eD910a)
- [NativeTokenGateway](https://basescan.org/address/0x8e890ca3829c740895cdEACd4a3BE36ff9343643)
- [Prime](https://basescan.org/address/0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30)
- [PrimeLiquidityProvider](https://basescan.org/address/0xcB293EB385dEFF2CdeDa4E7060974BB90ee0B208)
- Omnichain Governance:
    - Normal Timelock: [0x21c12f2946a1a66cBFf7eb997022a37167eCf517](https://basescan.org/address/0x21c12f2946a1a66cBFf7eb997022a37167eCf517)
    - FastTrack Timelock: [0x209F73Ee2Fa9A72aF3Fa6aF1933A3B58ed3De5D7](https://basescan.org/address/0x209F73Ee2Fa9A72aF3Fa6aF1933A3B58ed3De5D7)
    - Critical Timelock: [0x47F65466392ff2aE825d7a170889F7b5b9D8e60D](https://basescan.org/address/0x47F65466392ff2aE825d7a170889F7b5b9D8e60D)
    - Omnichain Governance Executor: [0xE7C56EaA4b6eafCe787B3E1AB8BCa0BC6CBDDb9e](https://basescan.org/address/0xE7C56EaA4b6eafCe787B3E1AB8BCa0BC6CBDDb9e)
    - Omnichain Executor Owner Proxy: [0x8BA591f72a90fb379b9a82087b190d51b226F0a9](https://basescan.org/address/0x8BA591f72a90fb379b9a82087b190d51b226F0a9)
    - ACMCommandsAggregator: [0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06](https://basescan.org/address/0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06)

#### References

- VIP simulations:
    - [ProtocolShareReserve and NativeTokenGateway](https://github.com/VenusProtocol/vips/pull/426)
    - [Markets](https://github.com/VenusProtocol/vips/pull/427)
    - [Prime](https://github.com/VenusProtocol/vips/pull/432)
    - [Omnichain Governance](https://github.com/VenusProtocol/vips/pull/433)
- [Deploy Venus on Base](https://community.venus.io/t/deploy-venus-on-base/4630)
- Snapshot ["Deploy Venus on Base"](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x353f5fb23ff895d89c21271ea1904af65e60557aeec317b24ce56d728d29b8c1)
- [Code of Omnichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- [Documentation - Technical article with more details of the Omnichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Base VIPs

Privilege commands on Base will be executed by the [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x5514a6ee48bc5a0ab6db631bdc26d69fad62174905bf8f12580a1532c642b300), [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xdf161ff5e3e1deef14f376ffb72bec2243cd8bf77589fa82290e439d09999aed), [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xb5f6aaf6aae7b82536aadaac4c68e30a62afcfa51274921ffaabffef2eed2e97) and [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x532c631053e4f4e926ab78492f6b3263cd4f4785a7d4df2a667e80ae7e1fc65f) multisig transactions will be executed. Otherwise, they will be rejected.
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.basemainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.basemainnet, basemainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, VENUS_STARS_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip408;
