import { cutParams as params } from "../../simulations/vip-181/vip-181/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const cutParams = params;

export const vip181 = () => {
  const meta = {
    version: "v2",
    title: "VIP-181 Fix on the Diamond Comptroller configuration",
    description: `#### Summary

If passed this VIP will apply a fix in the configuration of the Diamond Comptroller deployed at [VIP-174](https://app.venus.io/#/governance/proposal/174). It doesn’t involve any code change or contract upgrade.

#### Description

[VIP-174](https://app.venus.io/#/governance/proposal/174) didn't include the config in the Diamond Comptroller to route the function "venusInitialIndex()" to a specific facet. So, when the Diamond Comptroller receives the call to invoke that function (from the [VenusLens](https://bscscan.com/address/0xfB0f09dB330dC842a6637BfB959209424BbFE8C7) contract, for example) it throws the error "Diamond: Function does not exist".

The solution, proposed in this VIP, is to add a route in the Diamond Comptroller for the missing function. It could be routed to any facet, because the public constant "venusInitialIndex" is defined in the parent contract [FacetBase](https://github.com/VenusProtocol/venus-protocol/blob/main/contracts/Comptroller/Diamond/facets/FacetBase.sol#L26), extended by every facet. This VIP proposes to route it to the [MarketFacet](https://bscscan.com/address/0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa), where the "venusInitialIndex" constant is already used.

- Sighash of "venusInitialIndex()": 0xc5b4db55 (used to identify the invoked function)
- Market facet in mainnet: [0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa](https://bscscan.com/address/0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa)

**Security and additional considerations**

This VIP doesn’t involve any code change or contract upgrade. We applied the following security procedures for this configuration change:

- **Comptroller contract behavior post upgrade**: in a simulation environment, validating Comptroller works as expected after the configuration update, specifically the access to the function "venusInitialIndex()"
- **Comptroller storage layout**: in a simulation environment, validating the storage variables are accessible and correct after the upgrade
- **Deployment on testnet**: the same configuration change has been applied to the Diamond Comptroller [deployed to testnet](https://testnet.bscscan.com/tx/0x67a8d1be46858a40a38d6512489e746936a242c0ae756a5e52a4aeb78ba4ebf8), and used in the Venus Protocol testnet deployment

**Deployed contracts on main net**

- [Comptroller proxy (Unitroller)](https://bscscan.com/address/0xfd36e2c2a6789db23113685031d7f16329158384)
- [Comptroller implementation (Diamond)](https://bscscan.com/address/0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8)

**References**

- [Simulation pre and post upgrade](https://github.com/VenusProtocol/vips/pull/80)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/diamond-comptroller)
`,

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
