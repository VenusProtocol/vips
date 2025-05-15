import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const PESSIMISTIC_AMOUNT = parseUnits("14750", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("15000", 18);

const vip487 = () => {
  const meta = {
    version: "v2",
    title: "VIP-487 Payments issuance for audits",
    description: `If passed, this VIP will perform the following actions:

- Transfer 14,750 USDT to Pessimistic, for the audit of the Venus ERC4626 wrapper on the VTokens of Isolated pools
- Transfer 15,000 USDT to Fairyproof, for the audits of the Venus ERC4626 wrapper on the VTokens of Isolated pools, and the changes required for the block rate update on BNB Chain and opBNB

#### Details

**Pessimistic**

- Auditor: Pessimistic ([https://pessimistic.io](https://pessimistic.io/))
- Payload: Venus ERC4626 wrapper on the VTokens of Isolated pools
    - [https://github.com/VenusProtocol/isolated-pools/pull/497](https://github.com/VenusProtocol/isolated-pools/pull/497)
    - [https://github.com/VenusProtocol/protocol-reserve/pull/137](https://github.com/VenusProtocol/protocol-reserve/pull/137)
- Status: audit started on April 21st, 2025. Public report estimated by May 5th, 2025
- Cost: 14,750 USDT, to be sent to the BEP20 address 0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f

**Fairyproof**

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload 1: Venus ERC4626 wrapper on the VTokens of Isolated pools
    - [https://github.com/VenusProtocol/isolated-pools/pull/497](https://github.com/VenusProtocol/isolated-pools/pull/497)
    - [https://github.com/VenusProtocol/protocol-reserve/pull/137](https://github.com/VenusProtocol/protocol-reserve/pull/137)
    - Cost: 5,000 USDT
- Payload 2: Changes required for the block rate update on BNB Chain and opBNB
    - [https://github.com/VenusProtocol/venus-protocol/pull/576](https://github.com/VenusProtocol/venus-protocol/pull/576)
    - [https://github.com/VenusProtocol/governance-contracts/pull/139](https://github.com/VenusProtocol/governance-contracts/pull/139)
    - [https://github.com/VenusProtocol/venus-protocol/pull/574](https://github.com/VenusProtocol/venus-protocol/pull/574)
    - [https://github.com/VenusProtocol/solidity-utilities/pull/32](https://github.com/VenusProtocol/solidity-utilities/pull/32)
    - Cost: 10,000 USDT
- Total cost: 15,000 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/544)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PESSIMISTIC_AMOUNT, PESSIMISTIC_RECEIVER],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip487;
