import { ethers } from "hardhat";

import { cutParams as params } from "../../simulations/vip-361/utils/cut-params-mainnet.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const IL_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const vLUNA = "0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8";
export const vUST = "0x78366446547D062f45b4C0f320cDaa6d710D87bb";
export const vCAN = "0xeBD0070237a0713E8D94fEf1B728d3d993d290ef";
export const COMPTROLLER_IMPL = "0x7B586Aed00C85d7E32B463DCE094B1faCA7e7e7c";
export const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
export const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
export const cutParams = params;
export const vBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
export const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
export const vTRXOLD = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
export const vTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
export const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

export const vip361 = () => {
  const meta = {
    version: "v2",
    title: "VIP-361 Remove (logically) LUNA, UST and CAN markets",
    description: `#### Summary

If passed, this VIP will perform the following actions:

* Upgrade the implementation of the Comptroller contracts on every supported network, adding a new privilege function to allow Governance to remove (logically) markets from the pools
* Set as unlisted the following markets on BNB Chain: [vLUNA](https://bscscan.com/address/0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8), [vUST](https://bscscan.com/address/0x78366446547D062f45b4C0f320cDaa6d710D87bb) and [vCAN](https://bscscan.com/address/0xeBD0070237a0713E8D94fEf1B728d3d993d290ef)

#### Description

The upgrade of the Comptroller contracts includes a new feature on these contracts: unlist market. This feature will (logically) remove the specified markets from the list of supported markets. Only Governance will be authorized to execute the new feature.

In the current Core pool Comptroller on BNB Chain, a borrow cap equal to 0 corresponds to unlimited borrowing. This behavior is modified in the new implementation contract. So, if this VIP is executed, a borrow cap of 0 on the Core pool markets on BNB won’t allow any new borrow.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Configuration post VIP:** in a simulation environment, validating the upgrades of the Comptrollers are correct after the VIP
* **Deployment on testnet:** the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
* **Audit:** Certik and Fairyproof have audited the new Comptroller contracts

#### Audit reports

* [Certik audit report (2024/04/09)](https://github.com/VenusProtocol/venus-protocol/blob/f351525ec8ffe20261ee3fa53bc6ad7ff1309449/audits/099_unlistMarkets_certik_20240409.pdf)
* [Fairyproof report (2024/03/28)](https://github.com/VenusProtocol/venus-protocol/blob/f351525ec8ffe20261ee3fa53bc6ad7ff1309449/audits/102_unlistMarkets_fairyproof_20240328.pdf)

#### Deployed contracts to mainnet

* Core pool
    * [MarketFacet](https://bscscan.com/address/0x4b093a3299F39615bA6b34B7897FDedCe7b83D63)
    * [PolicyFacet](https://bscscan.com/address/0x93e7Ff7c87B496aE76fFb22d437c9d46461A9B51)
    * [SetterFacet](https://bscscan.com/address/0x9B0D9D7c50d90f23449c4BbCAA671Ce7cd19DbCf)
* [New Comptroller implementation of Isolated pools on BNB Chain](https://bscscan.com/address/0x7B586Aed00C85d7E32B463DCE094B1faCA7e7e7c)
* [New Comptroller implementation on Arbitrum one](https://arbiscan.io/address/0x4b256a7836415e09DabA40541eE78602Bc6B24bF)
* [New Comptroller implementation on Etherscan](https://etherscan.io/address/0xC910F2B196C516253e88b2097ba5D7d5fC9fa84e)
* [New Comptroller implementation on opBNB](https://opbnbscan.com/address/0xD3b2431c186A2bDEB61b86D9B042B75C954004F6)

#### References

* [Simulations post upgrade](https://github.com/VenusProtocol/vips/pull/184)
* [Changes and tests on the Core pool Comptroller on BNB Chain](https://github.com/VenusProtocol/venus-protocol/pull/438)
* [Changes and tests on the Comptroller contracts for Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/349)
* [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Ethereum, opBNB and Arbitrum one commands

Privilege commands on Ethereum, opBNB and Arbitrum one will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xd397a8986cb03a17aca2298e4132b86305442f7481913a97da0b5379eeed17ff), [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x6c9a5428fc5c1c26f2bb300b0a322523cd520cf94032bce3ac9c6fd5913539ba) and [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x9d40c75c019ebaee98df9514c49898b790bcea6ba3f722a18dfaa817239b94af) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", GUARDIAN],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", GUARDIAN],
      },
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vLUNA, vUST, vCAN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true],
      },
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vXVS], [2], true],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vBUSD, vSXP, vTRXOLD, vTUSDOLD, vXVS],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vLUNA],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vUST],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vCAN],
      },
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip361;
