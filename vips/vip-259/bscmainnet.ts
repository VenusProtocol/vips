import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";

export const vip259 = () => {
  const meta = {
    version: "v2",
    title: "VIP-259 Payments Issuance for audits",
    description: `#### Description

If passed this VIP will perform the following actions:

- Transfer 5,000 USDT to Pessimistic for the audit of the NativeTokenGateway contract
- Transfer 15,000 USDT to Fairyproof for the audit of the Time-based contracts and other changes

#### Details

Pessimistic - NativeTokenGateway

- Auditor: Pessimistic ([https://pessimistic.io](https://pessimistic.io/))
- Payload: NativeTokenGateway ([Core pool](https://github.com/VenusProtocol/venus-protocol/pull/442) and [Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/361)). This new contract will allow the interaction with the WETH market using ETH directly, in a transparent way
- Status: audit starts on February 20th, 2024. ETA: March 1st, 2024
- Cost: 5,000 USDT, to be sent to the BEP20 address 0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f

Fairyproof - Time-based contracts and other changes

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload:
    - [Timestamp-based Isolated lending contracts](https://github.com/VenusProtocol/isolated-pools/pull/324)
    - [Time-based XVSVault](https://github.com/VenusProtocol/venus-protocol/pull/418)
    - Reduce reserves with available cash ([Core pool](https://github.com/VenusProtocol/venus-protocol/pull/414) and [Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/337)
    - [Add Arbitrum sequencer downtime validation for Chainlink Oracle](https://github.com/VenusProtocol/oracle/pull/128)
    - [Seize XVS rewards](https://github.com/VenusProtocol/venus-protocol/pull/417)
    - [Dynamically Set Addresses for XVS and XVSVToken](https://github.com/VenusProtocol/venus-protocol/pull/410)
- Status: audit starts on February 16th, 2024. ETA: February 28th, 2024
- Cost: 15,000 USDT (10 working days), to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), PESSIMISTIC_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("15000", 18), FAIRYPROOF_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip259;
