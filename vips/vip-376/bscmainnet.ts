import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vip376 = () => {
  const meta = {
    version: "v2",
    title: "VIP-376 Risk Parameters Adjustments",
    description: `If passed, this VIP will increase the limits in the XVS bridge between zkSync and BNB Chain, in the zkSync side following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12)

In the [VIP-372](https://app.venus.io/#/governance/proposal/372?chainId=56) the single transaction and daily XVS bridge limits for BNB Chain → zkSync were updated, but the associated limits on zkSync were not updated. In this VIP, these limits are set to the expected values:

- Maximum bridged XVS in a single transaction: 20,000 USD
- Maximum bridged XVS in 24 hours: 100,000 USD

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/397)
- [VIP-372 Risk Parameters Adjustments](https://app.venus.io/#/governance/proposal/372?chainId=56)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0xa811e29cd5470ade43dcd536225c209190a52f92fd515fd2f82dfdc319e908c0) multisig transaction will be executed. Otherwise, it will be rejected.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip376;
