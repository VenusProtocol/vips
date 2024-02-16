import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
const VENUS_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

export const vip258 = (data?: string) => {
  const meta = {
    version: "v2",
    title: "VIP-258 Liquidator contract upgrade - Automatic Income Allocation",
    description: `#### Summary

If passed this VIP will upgrade the implementation of the Liquidator contract, entry point for the liquidations in the Venus Core pool

#### Description

This VIP is part of the proposal [Automatic Income Allocation & Token Converter](https://community.venus.io/t/automatic-income-allocation-token-converter/3702), published in the Venus community forum. This VIP upgrades the implementation of the [Liquidator contract](https://bscscan.com/address/0x0870793286aaDA55D39CE7f82fb2766e8004cF43). This upgrade enables several new features:

- Redeem of the vTokens assigned to the protocol, in the same liquidation transaction. The underlying tokens received will be sent to the [ProtocolShareReserve contract](https://bscscan.com/address/0xCa01D5A9A248a830E9D93231e791B1afFed7c446), where they will be distributed following the Tokenomics rules associated with “[Additional Revenue Streams](https://docs-v4.venus.io/governance/tokenomics#allocation-for-additional-revenue-streams)”
- Allow to force liquidators to first liquidate VAI positions when a liquidation is doable. The goal is to reduce the likelihood of generating bad debt in VAI. This feature will be initially disabled, giving time to the liquidators to integrate it in their codebase. It will be enabled in the future via a new VIP.
- Integration of the [Access Control Manager contract](https://bscscan.com/address/0x4788629abc6cfca10f9f969efdeaa1cf70c23555), allowing the execution of [Fast-track](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d) VIP’s for some configuration commands related with the liquidations in the core pool.

#### Extra consideration forcing to liquidate VAI

If every statement in the following list is true, the liquidation transactions will be reverted:

- The liquidator is liquidating a debt on a market different to VAI, **and**
- The VAI debt of the borrower is greater than the configured threshold (set to 1,000 VAI in this VIP, and adjustable in the future with a VIP), **and**
- The feature flag is enabled (it is initially disabled, adjustable in the future via another VIP), **and**
- The liquidation of VAI is not paused in the Core pool comptroller

Because the feature to force VAI liquidations first will be initially disabled, there won’t be any impacts on liquidations after executing this VIP. But, when the new feature is enabled (via VIP, in the future), liquidators will have to liquidate first the VAI debt positions of an insolvent account (if they are greater than 1,000 VAI and the rest of the conditions listed are satisfied). Otherwise, their liquidation transactions will be reverted. This feature will be enabled only once liquidators have made the required changes on their side.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Liquidator contract behavior post upgrade**: in a simulation environment, validating liquidations work as expected after the upgrade
- **Deployment on testnet**: the same liquidator has been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audits**: OpenZeppelin, Quantstamp, Certik and Peckshield have audited the deployed code

#### Audit reports

- [OpenZeppelin audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/048_liquidator_openzeppelin_20230720.pdf) (2023/July/20)
- [Quantstamp audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/046_liquidator_quantstamp_20230717.pdf) (2023/July/17)
- [Certik audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/041_liquidator_certik_20230704.pdf) (2023/July/4)
- [Peckshield audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/039_liquidator_peckshield_20230705.pdf) (2023/July/5)

#### Deployed contracts on mainnet

- [New Liquidator implementation](https://bscscan.com/address/0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965)

#### References

- [Repository](https://github.com/VenusProtocol/venus-protocol)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/31)
- [Liquidator proxy contract](https://bscscan.com/address/0x0870793286aada55d39ce7f82fb2766e8004cf43)
- Documentation
    - [Automatic income allocation](https://docs-v4.venus.io/whats-new/automatic-income-allocation)
    - [Liquidate VAI debt first](https://docs-v4.venus.io/guides/liquidation#force-vai-debt-first)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setTreasuryPercent(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setMinLiquidatableVAI(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setPendingRedeemChunkLength(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: PROXY_ADMIN,
        signature: "upgradeAndCall(address,address,bytes)",
        params: [LIQUIDATOR, "0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965", data],
      },

      {
        target: LIQUIDATOR,
        signature: "setPendingRedeemChunkLength(uint256)",
        params: [10],
      },

      {
        target: LIQUIDATOR,
        signature: "setMinLiquidatableVAI(uint256)",
        params: [parseUnits("1000", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip258;
