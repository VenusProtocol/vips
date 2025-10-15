import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-544/utils/cur-params-bscmainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const RISK_STEWARD_RECEIVER_BSCMAINNET = "0xBa2a43279a228cf9cD94d072777d8d98e7e0a229";
export const MARKET_CAP_RISK_STEWARD_BSCMAINNET = "0xE7252dccd79F2A555E314B9cdd440745b697D562";
export const ANY_TARGET_CONTRACT = ethers.constants.AddressZero;

export const MORE_THAN_1_DAY = 86401; // 24 hours + 1 second
export const cutParams = params;

export const vip544 = () => {
  const meta = {
    version: "v2",
    title: "VIP-544 [BNB Chain] Chaos Labs' Risk Oracle integration (1/2)",
    description: `#### Summary

If passed, following the community proposal “[Integrate Chaos Labs’ Risk Oracle to Venus Protocol](https://community.venus.io/t/integrate-chaos-labs-risk-oracle-to-venus-protocol/4569)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6d84d48a17981a84e3eb320139552306f70fd006d7f3d9df131e20002e98620c)), this VIP will integrate the Chaos Labs’ Risk Oracle into Venus Protocol on BNB Chain, allowing the update of the supply and borrow caps of the Venus markets (on Isolated Pools) on this chain without VIP’s, considering Chaos Labs recommendations.

Moreover, this VIP would upgrade the implementation of the [Comptroller contract for the Core pool on BNB Chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384), aligning its interface with the Comptroller contract used in the Isolated Pools. This change will simplify future interactions with both Comptroller contracts.

#### Description

[Chaos Labs’ Risk Oracle](https://github.com/ChaosLabsInc/risk-oracle) is a system composed of off-chain artifacts, where simulations and recommendations are defined, and a smart contract where [Chaos Labs](https://chaoslabs.xyz/) will submit recommendations for the Venus Protocol. These recommendations will be processed by the Venus Risk Steward contracts, performing some checks before applying them in the affected markets.

Main characteristics of the Risk Stewards enabled in this VIP:

- Only the supply and borrow caps can be adjusted—either increased or decreased. All other risk parameters cannot be updated
- The new caps cannot be greater or lower than 50% of the current caps. For example, given the current supply cap of the market [WBNB on the Liquid Staked BNB pool](https://app.venus.io/#/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2?chainId=56&tab=supply) is 15K WBNB, Risk Stewards will be only able to set a new supply cap between 7.5K and 22.5K WBNB in one transaction. This limit can be modified with a VIP.
- Risk Stewards can only update the supply cap for a specific market once every 24 hours. The same rule applies to borrow cap updates. This constraint can be modified with a VIP.
- Risk Stewards will initially only be allowed to update markets in the Isolated Pools. In a separate VIP, they’ll also be granted permission to update markets in the Core Pool. This phased rollout is part of the overall security strategy.

#### Next steps

A new VIP will be proposed in the coming days to enable this integration for the markets in the Core pool on BNB Chain. Markets on other supported networks will be integrated at a later stage.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), [Quanstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the expected permissions are configured and the Risk Steward can update the caps as expected
- **Deployment on testnet**: the same commands have been executed on every testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/governance-contracts/blob/210d1e54f0c9136a805977b41077567b0883a4e0/audits/120_risk_stewards_v1_certik_20250219.pdf) (2025/02/19)
- [Quantstamp](https://github.com/VenusProtocol/governance-contracts/blob/210d1e54f0c9136a805977b41077567b0883a4e0/audits/121_risk_stewards_v1_quantstamp_20250213.pdf) (2025/02/13)
- [Fairyproof audit report](https://github.com/VenusProtocol/governance-contracts/blob/210d1e54f0c9136a805977b41077567b0883a4e0/audits/122_risk_stewards_v1_fairyproof_20250226.pdf) (2025/02/26)

#### Deployed contracts

- BNB Chain
    - [RiskStewardReceiver](https://bscscan.com/address/0xBa2a43279a228cf9cD94d072777d8d98e7e0a229)
    - [MarketCapsRiskSteward](https://bscscan.com/address/0xE7252dccd79F2A555E314B9cdd440745b697D562)
    - [RiskOracle (managed by Chaos Labs)](https://bscscan.com/address/0x66A8cb6c4230B044378aC3676D47Ed4fE18e3cFB)
    - New facets
        - [MarketFacet](https://bscscan.com/address/0x94573965fbCCAC5cD4558208A8cCB3F18E71B7Db)
        - [PolicyFacet](https://bscscan.com/address/0x5bb2Dfe996629E558Cd5BDBfC4c0eC7367BB96E9)
        - [SetterFacet](https://bscscan.com/address/0x9D1fdD581Bd6E638A7b98ac5567248A0c4E88f64)
- BNB Chain testnet
    - [RiskStewardReceiver](https://testnet.bscscan.com/address/0x31DEb4D1326838522697f7a012992f0824d80f2b)
    - [MarketCapsRiskSteward](https://testnet.bscscan.com/address/0x9b40390771cAeEa69DE55EEd176aeDC72d70cA3E)
    - [RiskOracle (managed by Chaos Labs)](https://testnet.bscscan.com/address/0x7BD97DD6C199532d11Cf5f55E13a120dB6dd0F4F)
    - New facets
        - [MarketFacet](https://testnet.bscscan.com/address/0x377c2E7CE08B4cc7033EDF678EE1224A290075Fd)
        - [PolicyFacet](https://testnet.bscscan.com/address/0x671B787AEDB6769972f081C6ee4978146F7D92E6)
        - [SetterFacet](https://testnet.bscscan.com/address/0xb619F7ce96c0a6E3F0b44e993f663522F79f294A)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/520)
- [Codebase of the new facets for the Core pool Comptroller on BNB Chain](https://github.com/VenusProtocol/venus-protocol/pull/548)
- [Codebase of the Risk Steward contracts](https://github.com/VenusProtocol/governance-contracts/pull/115)
- [Codebase of the RiskOracle contract, by Chaos Labs](https://github.com/ChaosLabsInc/risk-oracle)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Update diamond cut
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      // Permissions
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_BSCMAINNET,
          "setRiskParameterConfig(string,address,uint256)",
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSCMAINNET],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSCMAINNET],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.GUARDIAN],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.GUARDIAN],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      // Set risk parameter configurations
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BSCMAINNET, MORE_THAN_1_DAY],
      },
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BSCMAINNET, MORE_THAN_1_DAY],
      },
      // Accept ownership of Risk Steward Receiver
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "acceptOwnership()",
        params: [],
      },
      // Accept ownership of Market Cap Risk Steward
      {
        target: MARKET_CAP_RISK_STEWARD_BSCMAINNET,
        signature: "acceptOwnership()",
        params: [],
      },
      // Pause Risk Steward Receiver
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "pause()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip544;
