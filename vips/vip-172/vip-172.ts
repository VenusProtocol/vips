import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xb5Cb55cAbC34544C708289D899Dfe2f190794C8D";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

export const vip172 = () => {
  const meta = {
    version: "v2",
    title: "VIP-172 Add forced liquidations feature into the Core pool",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of the Comptroller contract of the Core pool, including the feature “forced liquidations” as [suggested by Chaos Labs](https://community.venus.io/t/busd-deprecation-forced-liquidations/3784).

#### Description

This VIP upgrades the implementation of the Comptroller contract in the core pool, including the feature “forced liquidations”, that will be **initially disabled for every market**.

If “forced liquidations” are enabled for a market, borrow positions can be liquidated in that market even when the health rate of the user is greater than 1 (i.e. when the account is collateralized). Additionally, the close factor check is ignored, allowing the liquidation of 100% of the debt in one transaction.

This feature is based on the implementation done by Compound V2 [here](https://github.com/compound-finance/compound-protocol/pull/123/files). Compound V2 allows “forced liquidations” on markets as soon as the Collateral factor is zero, the Reserve factor is 100% and the borrows are paused. Venus defines a feature flag to enable/disable “forced liquidations”, configurable directly via VIP, not based on other parameters.

To check if “forced liquidations” are enabled in one market, the function _Comptroller.isForcedLiquidationEnabled(address vToken)_ can be called on the Comptroller contract of the pool, providing the address of the market to check.

Finally, this VIP will authorize Normal, Fast-track and Critical timelocks to enable and disable the forced liquidations on any market of the Core pool.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Behavior post upgrade:** in a simulation environment, validating “forced liquidations” work as expected after the upgrade
* **Deployment on testnet:** the same implementation has been deployed to testnet, and used in the Venus Protocol testnet deployment
* **Audit:** Certik and Peckshield have audited the deployed code

#### Audit reports

* [Certik audit report (2023/09/16)](https://github.com/VenusProtocol/venus-protocol/blob/80cf9b36ea900d71c5e97a5b1d5e2706ecefb9c3/audits/072_forcedLiquidations_certik_20230916.pdf)
* [Peckshield audit report (2023/09/16)](https://github.com/VenusProtocol/venus-protocol/blob/80cf9b36ea900d71c5e97a5b1d5e2706ecefb9c3/audits/073_forcedLiquidations_peckshield_20230916.pdf)

#### Deployed contracts

* [New Comptroller implementation](https://bscscan.com/address/0xb5Cb55cAbC34544C708289D899Dfe2f190794C8D) - mainnet
* [New Comptroller implementation](https://testnet.bscscan.com/address/0xa8A476AD16727CE641f27d7738D2D341Ebad81CC) - testnet

#### References

* [Pull request with the changeset](https://github.com/VenusProtocol/venus-protocol/pull/332)
* [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/69)
* [Comptroller proxy contract in the core pool (Unitroller)](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
* [Documentation](https://docs-v4.venus.io/guides/liquidation#forced-liquidations)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_COMPTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
