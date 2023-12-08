import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { cutParams } from "./cuts/mainnet.json";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NEW_DIAMOND_IMPLEMENTATION = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";
const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const commands = [
  {
    target: UNITROLLER,
    signature: "_setPendingImplementation(address)",
    params: [NEW_DIAMOND_IMPLEMENTATION],
  },
  {
    target: NEW_DIAMOND_IMPLEMENTATION,
    signature: "_become(address)",
    params: [UNITROLLER],
  },
  {
    // Note that mainnet cuts should be updated after Prime VIP is executed
    target: UNITROLLER,
    signature: "diamondCut((address,uint8,bytes4[])[])",
    params: [cutParams],
  },
  ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [UNITROLLER, "_setForcedLiquidationForUser(address,address,bool)", timelock],
  })),
];

const meta = {
  version: "v2",
  title: "VIP-209 Add forced liquidations for individual accounts into the Core pool",
  description: `#### Summary

If passed, this VIP will upgrade the implementation of the Comptroller contract of the Core pool, including the feature “forced liquidations for individual accounts”, as an extension of the feature included in [VIP-172](https://app.venus.io/#/governance/proposal/172).

#### Description

This VIP upgrades the implementation of the Comptroller contract in the core pool, including the feature “forced liquidations for individual accounts”, that will be **initially disabled for every market and account**.

If “forced liquidations for individual accounts” are enabled for an account in a market, borrow positions of the specific user can be liquidated in that market even when the health rate of the user is greater than 1 (i.e. when the account is collateralized). Additionally, the close factor check is ignored, allowing the liquidation of 100% of the debt in one transaction.

This feature is based on the implementation done by Compound V2 [here](https://github.com/compound-finance/compound-protocol/pull/123/files). Compound V2 allows “forced liquidations” on markets as soon as the Collateral factor is zero, the Reserve factor is 100% and the borrows are paused. Venus defines a feature flag to enable/disable “forced liquidations for individual accounts”, configurable directly via VIP, not based on other parameters. This feature is an extension of the feature [suggested by Chaos Labs](https://community.venus.io/t/busd-deprecation-forced-liquidations/3784), and deployed in [VIP-172](https://app.venus.io/#/governance/proposal/172).

To check if “forced liquidations for individual accounts” are enabled for an account in one market, the function "Comptroller.isForcedLiquidationEnabledForUser(account address, vToken address)" can be called on the Comptroller contract of the pool, providing the address of the account and market to check.

Finally, this VIP will authorize [Normal](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396), [Fast-track](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d) timelocks to enable and disable the forced liquidations for individual accounts on any market of the Core pool.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Behavior post upgrade**: in a simulation environment, validating “forced liquidations for individual accounts” work as expected after the upgrade
- **Deployment on testnet**: the same implementation has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet
    - [New Comptroller implementation](https://bscscan.com/address/0xD93bFED40466c9A9c3E7381ab335a08807318a1b)
    - [New PolicyFacet contract](https://bscscan.com/address/0xa7fE89d9A7F9dc097fb71F13e2E025165CBf431f)
    - [New SetterFacet contract](https://bscscan.com/address/0xF2b7D75557B75a878E997934014E95Dd089B5f24)
- Testnet
    - [New Comptroller implementation](https://testnet.bscscan.com/address/0x795F7238514DE51d04a3550089a62F59ef6992Ad)
    - [New PolicyFace contract](https://testnet.bscscan.com/address/0xb16399Cb0f54D73D045F476b03A6Cb468F6BE7D2)
    - [New SetterFacet contract](https://testnet.bscscan.com/address/0xD346A70320C7Bca8A68b1aaF9eea1b1055BAB74B)

#### References

- [Pull request with the changeset](https://github.com/VenusProtocol/venus-protocol/pull/380)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/109)
- [Comptroller proxy contract in the core pool (Unitroller)](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
- [Documentation](https://docs-v4.venus.io/guides/liquidation#forced-liquidations)`,
  forDescription: "Execute this proposal",
  againstDescription: "Do not execute this proposal",
  abstainDescription: "Indifferent to execution",
};

export const vip209 = () => {
  return makeProposal(commands, meta, ProposalType.REGULAR);
};
