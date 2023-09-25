import { cutParams as params } from "../../simulations/vip-174/vip-174/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const DIAMOND = "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PAUSE_GUARDIAN_MULTISIG = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const cutParams = params;

interface GrantAccess {
  target: string;
  signature: string;
  params: Array<string>;
}

const grantAccessControl = () => {
  const accessProposals: Array<GrantAccess> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, PAUSE_GUARDIAN_MULTISIG].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [UNITROLLER, "_setActionsPaused(address[],uint256[],bool)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "_setActionsPaused(address[],uint8[],bool)", target],
    });
  });

  return accessProposals;
};

export const vip174 = () => {
  const meta = {
    version: "v2",
    title: "VIP-174 Core pool Comptroller upgrade - Diamond Comptroller",

    description: `#### Summary

    If passed this VIP will upgrade the implementation of the Comptroller
    contract in the Core pool. It will set a re-architectured Comptroller following the [Diamond
    pattern](https://eips.ethereum.org/EIPS/eip-2535), not adding new features now for the regular
    users. This upgrade will allow Venus to add new features in the Core pool in the future, unlocking the Ethereum
    limitation on the size of the contracts (maximum 24KB) added in the [EIP-170](https://eips.ethereum.org/EIPS/eip-170).

    #### Description
    
    This VIP upgrades the implementation of the [Comptroller
    contract in the Core pool](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384). As features continued to be
    introduced to the Core Pool Comptroller contract, it grew to exceed the [maximum allowable size of 24KB](https://eips.ethereum.org/EIPS/eip-170).
    In response to this challenge and to preemptively address similar issues in the future, a multifaceted diamond pattern was implemented.
    
    The original comptroller was refactored using the [EIP-2535](https://eips.ethereum.org/EIPS/eip-2535)
    diamond pattern into distinct facets. This restructuring aligns the storage layout with that of the Comptroller proxy,
    streamlining the contract's organization and enhancing efficiency. As a consequence user interactions now trigger two delegate calls.
    
    Users will continue to interact with the [Unitroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
    proxy contract same as before with one significant difference. Now the Diamond proxy serves as the implementation contract for the
    Unitroller, and the Comptroller's implementation has been divided into multiple facets. These facets will function as the various
    components of the Diamond proxy.
    
    Facets:
    
    * PolicyFacet: this facet contains all the external pre-hook functions related to vToken.
    * SetterFacet: this facet contains all setter configuration functions.
    * MarketFacet: this facet provides information about the asset in the	market that you are in at that time. This facet is also responsible	for entering and exiting the market.
    * RewardFacet: this facet provides the external functions related to	all claims and rewards of the protocol, it has the following.
    
    You
    can see more technical details about the Diamond Comptroller in the [documentation
    site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/diamond-comptroller).
    
    #### Security and additional considerations
    
    We applied the following security procedures for this upgrade:
    
    * **Comptroller contract behavior post upgrade**: in a simulation	environment, validating Comptroller work as expected after the	upgrade
    * **Comptroller storage layout**: in a simulation environment,	validating the storage variables are accessible and correct after	the upgrade
    * **Deployment on testnet**: the same Diamond Comptroller has been	[deployed	to testnet](https://testnet.bscscan.com/tx/0x8ef7a72736d49f4babd624c8dc353589a1d659fe9995f358cca8c2305f21b2ba), and used in the Venus Protocol testnet	deployment
    * **Audit:** OpenZeppelin, Quantstamp, Certik, Peckshield and	Fairyproof have audited the deployed code
    
    #### Audit reports
    
    * [OpenZeppelin	audit report (2023/08/17)](https://github.com/VenusProtocol/venus-protocol/blob/8553387f2277be152883b4ee22211b77a8cbe5f6/audits/049_diamondComptroller_openzeppelin_20230817.pdf)
    * [Quantstamp	audit report (2023/09/19)](https://github.com/VenusProtocol/venus-protocol/blob/8553387f2277be152883b4ee22211b77a8cbe5f6/audits/047_diamondComptroller_quantstamp_20230919.pdf)
    * [Certik	audit audit report (2023/08/03)](https://github.com/VenusProtocol/venus-protocol/blob/8553387f2277be152883b4ee22211b77a8cbe5f6/audits/044_diamondComptroller_certik_20230803.pdf)
    * [Peckshield	audit report (2023/07/28)](https://github.com/VenusProtocol/venus-protocol/blob/8553387f2277be152883b4ee22211b77a8cbe5f6/audits/042_diamondComptroller_peckshield_20230718.pdf)
    * [Fairyproof	audit report (2023/06/25)](https://github.com/VenusProtocol/venus-protocol/blob/8553387f2277be152883b4ee22211b77a8cbe5f6/audits/040_diamondComptroller_fairyproof_20230625.pdf)
    
    #### Deployed contracts
    
    * [Comptroller	proxy (Unitroller)](https://bscscan.com/address/0xfd36e2c2a6789db23113685031d7f16329158384)
    * [Current	Comptroller implementation](https://bscscan.com/address/0x909dd16b24cef96c7be13065a9a0eaf8a126ffa5)
    * [New	Comptroller implementation (Diamond)](https://bscscan.com/address/0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8)
    * Facets on mainnet:
        * [MarketFacet](https://bscscan.com/address/0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa)
        * [PolicyFacet](https://bscscan.com/address/0xCE305b594A7714E9ed8eDE23c111aFf6A2d54E0e)
        * [RewardFacet](https://bscscan.com/address/0x71e7AAcb01C5764A56DB92aa31aA473e839d964F)
        * [SetterFacet](https://bscscan.com/address/0xc3CE70d9bBE8f63510f3C6dBf1C025113C79B40c)
    
    #### References
    
    * [Pull	request with the changeset](https://github.com/VenusProtocol/venus-protocol/pull/224)
    * [Simulation	pre and post upgrade](https://github.com/VenusProtocol/vips/pull/11/)
    * [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/diamond-comptroller)`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      ...grantAccessControl(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
