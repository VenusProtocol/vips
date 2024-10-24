import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

const vip386 = () => {
  const meta = {
    version: "v2",
    title: "VIP-386 [zkSync] XVS rewards on zkSync",
    description: `#### Summary

Following [VIP-369 [zkSync] XVS rewards on zkSync](https://app.venus.io/#/governance/proposal/369), if passed, this VIP will configure the XVS emissions in every market enabled on zkSync Era for the following 3 months (following the proposal [[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580)).

#### Description

According to the proposal [[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580), the following XVS rewards will be enabled on zkSync Era for the next 90 days:

- **Market Emissions**: 18,000 XVS allocated as liquidity incentives, for the following markets in the Core pool on zkSync Era:
    - WETH: 3,600 XVS
    - WBTC: 3,600 XVS
    - USDT: 2,700 XVS
    - USDC.e: 5,400 XVS
    - ZK: 2,700 XVS
    - In every case, 80% of the XVS rewards will be for the suppliers and 20% for the borrowers

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/409)
- Snapshot “[[ZKsync] XVS Incentives Model Proposal](https://snapshot.org/#/venus-xvs.eth/proposal/0x646fa7f813e73b6f330b9dcf0e5e88733e8b35ff59736e6ac3c54dcad6fb03d2)”
- Community proposal “[[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580)”
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x51b754d3346c8849b777ce18ebb0ed0527f460dab0fbef1b219fa353def0f0b0) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip386;
