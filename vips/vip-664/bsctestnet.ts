import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

// TokenRedeemer deployed on BNB Chain Testnet, owned by the NormalTimelock.
// Verified on-chain: owner() == NORMAL_TIMELOCK (0xce10739590001705F7FF231611ba4A48B2820327).
export const TOKEN_REDEEMER = "0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd";

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] Recover stuck XVS from TokenRedeemer to the Treasury",
    description: `#### Summary

If passed, this VIP will use the **TokenRedeemer** governance contract on BNB Chain Testnet to sweep its entire **XVS** balance to the **Treasury**, demonstrating the protocol's token-recovery capability.

#### Motivation

The TokenRedeemer contract (owned by the NormalTimelock) exposes \`sweepTokens(token, destination)\`, an owner-only function that transfers the full balance of an ERC-20 token held by the contract to a destination address. This VIP exercises that path to recover any XVS stuck on the contract and route it to the Treasury.

#### Proposed Changes

- Call \`sweepTokens(XVS, VTreasury)\` on the TokenRedeemer (\`0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd\`), transferring its full XVS balance to the Treasury.

#### Deployed Contract

- TokenRedeemer (BNB Chain Testnet): [\`0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd\`](https://testnet.bscscan.com/address/0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd) — owned by the NormalTimelock.

#### Conclusion

This VIP recovers stuck XVS to the Treasury via the governance-owned TokenRedeemer.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TOKEN_REDEEMER,
        signature: "sweepTokens(address,address)",
        params: [bsctestnet.XVS, bsctestnet.VTREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
