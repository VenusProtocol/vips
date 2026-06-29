import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PRIME_V2 } from "./addendum-testnet-reset";
import { PLP } from "./bsctestnet";

// vWBNB on the Core pool (bsctestnet) and its underlying WBNB token.
export const VWBNB = "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

// Mirrors the legacy mainnet Prime treatment of WBNB (supply-only boost).
export const SUPPLY_MULTIPLIER = parseUnits("2", 18).toString();
export const BORROW_MULTIPLIER = "0";

// Mirrors the WBNB distribution speed configured on the mainnet PrimeLiquidityProvider
// so the testnet rewards behavior tracks production magnitudes for FE/BE testing.
export const WBNB_DISTRIBUTION_SPEED = "3472222222222";

const vip675Addendum4 = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 addendum 4 [Testnet] Add vWBNB market to PrimeV2",
    description: `#### Summary

If passed, this fourth addendum to VIP-675 will add the vWBNB market to PrimeV2 on BNB Chain testnet so FE/BE integration can exercise the new market flow end-to-end.

#### Description

If passed, this addendum will:

- Initialize WBNB on the PrimeLiquidityProvider so it can start accruing Prime rewards (one-time per token; \`lastAccruedBlock[WBNB] = 0\` today, so this is required before any reward distribution call).
- Set the WBNB distribution speed on the PrimeLiquidityProvider to \`${WBNB_DISTRIBUTION_SPEED}\` wei/block, mirroring the WBNB distribution speed configured on the mainnet PrimeLiquidityProvider so testnet reward magnitudes track production for FE/BE integration.
- Add the vWBNB market to PrimeV2 with supply multiplier \`2e18\` (2.0x) and borrow multiplier \`0\`, mirroring the legacy mainnet Prime treatment of WBNB.

The NormalTimelock already holds the required permissions: PLP \`initializeTokens\` is \`onlyOwner\` (owner = NormalTimelock), and PLP \`setTokensDistributionSpeed\` and PrimeV2 \`addMarket\` are ACM-gated to the NormalTimelock by the original VIP-675 / addendum 3.

#### References

- Original VIP-675 (PrimeV2 / PrimeLeaderboard setup): https://github.com/VenusProtocol/vips/pull/712`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Initialize WBNB on the PrimeLiquidityProvider (onlyOwner = NormalTimelock).
      //    Required before setTokensDistributionSpeed for a previously unknown token.
      {
        target: PLP,
        signature: "initializeTokens(address[])",
        params: [[WBNB]],
      },

      // 2. Set the WBNB per-block distribution speed on the PrimeLiquidityProvider.
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[WBNB], [WBNB_DISTRIBUTION_SPEED]],
      },

      // 3. Add the vWBNB market to PrimeV2.
      {
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [VWBNB, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip675Addendum4;
