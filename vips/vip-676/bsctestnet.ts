import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSTOCK_PAUSE_SENTINEL = "0xC25b2B657D24380eDd1a1Cff5296385541e85204";
export const NEW_BSTOCK_PAUSE_SENTINEL_IMPLEMENTATION = "0x0965e122751aC3Db4621eB7A571C9C4a7c9ED659";
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";

const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";

export const vip676 = () => {
  const meta = {
    version: "v2",
    title: "VIP-676 [BNB Chain Testnet] BStockPauseSentinel compliance-block check",
    description: `#### Summary

Upgrades the BStockPauseSentinel on BNB Chain Testnet to its HashDit-audited build. That build also treats a market as paused when the bStock's compliance module blocks the market's vToken, since the token can then no longer move in or out of the market.

#### Actions

1. Upgrade the **BStockPauseSentinel** proxy [${BSTOCK_PAUSE_SENTINEL}](https://testnet.bscscan.com/address/${BSTOCK_PAUSE_SENTINEL}) to [${NEW_BSTOCK_PAUSE_SENTINEL_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_BSTOCK_PAUSE_SENTINEL_IMPLEMENTATION}).

#### Notes

- Testnet only.
- The proxy address, its owner, EBrake and the ACM permissions stay the same. EBrake already runs the implementation that acts on Spoke markets.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSTOCK_PAUSE_SENTINEL, NEW_BSTOCK_PAUSE_SENTINEL_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip676;
