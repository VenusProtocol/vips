import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const NEW_VAI_CONTROLLER_IMPL = "0xc1aAdEA20c755C445D0ca80f01989CCFB32C93Cc";

const vip299 = () => {
  const meta = {
    version: "v2",
    title: "VIP-299 Upgrade of VAIController",
    description: `#### Summary

If passed, this VIP will upgrade the implementation contract of the [VAI Unitroller contract](https://bscscan.com/address/0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE)

#### Description

The upgrade of the VAIController fixes the calculation of the seized amount during VAI liquidations. The current implementation only takes into account the original VAI debt. The new implementation takes into account the original VAI debt plus the VAI interests generated. With this fix, every liquidation will be profitable for liquidators, avoiding the generation of bad debt for the protocol.

Moreover, the new implementation adds the function repayVAIBehalf, that could be used in another VIP in the future to repay the current VAI bad debt.

#### Security and additional considerations**

We applied the following security procedures for this upgrade:

* **Configuration post VIP:** in a simulation environment, validating the upgrade of the VAIController is correct after the VIP
* **Deployment on testnet:** the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
* **Audit:** Certik, Pessimistic and Fairyproof have audited the fix on the VAIController

#### Audit reports

* [Certik audit report (2024/04/26)](https://github.com/VenusProtocol/venus-protocol/blob/0000b6b7bb9eaf1d6827993c306b776c371d41b7/audits/107_vaiController_certik_20240426.pdf)
* [Pessimistic audit report (2024/05/02, the report will be published after executing the VIP)](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/109_vaiController_pessimistic_20240502.pdf)
* [Fairyproof report (2024/04/18)](https://github.com/VenusProtocol/venus-protocol/blob/0000b6b7bb9eaf1d6827993c306b776c371d41b7/audits/108_vaiController_fairyproof_20240418.pdf)

#### Deployed contracts to mainnet

* [New VAIController on mainnet](https://bscscan.com/address/0x43E330C8F8E301c665d825015fddf117e76676Dc)
* [New VAIController on testnet](https://testnet.bscscan.com/address/0x181936d73641c0B002649B7dD08b51ab935d58C2)

#### References

* [VIP executed on testnet](https://testnet.bscscan.com/tx/0x00e850083242996f45631cf22f0313a397dfcf30d91aa5ad9427250f6ab3fa55)
* [Pull request with the VAIController upgrade](https://github.com/VenusProtocol/venus-protocol/pull/467)
* [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/259)
* [Documentation](https://docs-v4.venus.io/tokens/vai/vai-controller)
* [Documentation updates](https://github.com/VenusProtocol/venus-protocol-documentation/pull/198/files)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER_IMPL],
      },
      {
        target: NEW_VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip299;
