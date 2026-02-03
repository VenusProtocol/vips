import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// Deployed contract addresses on BSC Testnet
export const DEVIATION_SENTINEL = "0x9245d72712548707809D66848e63B8E2B169F3c1";

// Access Control Manager
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const vip900TestnetAddendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-900 Addendum: Grant _setActionsPaused permission to DeviationSentinel on BSC Testnet",
    description: `#### Summary

This addendum to VIP-900 grants the missing \`_setActionsPaused(address[],uint8[],bool)\` permission to the DeviationSentinel contract on BSC Testnet.

#### Description

The original VIP-900 granted the \`setActionsPaused(address[],uint8[],bool)\` permission but missed the underscore-prefixed version \`_setActionsPaused(address[],uint8[],bool)\` which is the actual internal function signature used by comptrollers.

This addendum grants:
- \`_setActionsPaused(address[],uint8[],bool)\` permission to DeviationSentinel on any comptroller (address zero pattern)

This allows DeviationSentinel to properly pause/unpause market actions when price deviations are detected.

#### References

- [DeviationSentinel Contract](https://testnet.bscscan.com/address/${DEVIATION_SENTINEL})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Allow DeviationSentinel to pause/unpause actions on any comptroller (underscore version)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip900TestnetAddendum;
