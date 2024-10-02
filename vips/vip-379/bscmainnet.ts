import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

const vip379 = () => {
  const meta = {
    version: "v2",
    title: "VIP-379 [zkSync] Risk Parameters Adjustment (WETH, ZK)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 10/03/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-03-24/4599).

- [ZK (Core pool)](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616): increase supply cap from 35M ZK to 50M ZK
- [WETH (Core pool)](https://explorer.zksync.io/address/0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8):
    - increase supply cap from 3,000 WETH to 6,000 WETH
    - increase borrow cap from 1,700 WETH to 3,400 WETH

Review the Chaos Labs’ recommendations for a deeper analysis.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/403](https://github.com/VenusProtocol/vips/pull/403)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x85efd5e381829924cbc3205c908ce1700c09e34a0596134af6ef975cfd51f31d) multisig transaction will be executed. Otherwise, it will be rejected.
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

export default vip379;
