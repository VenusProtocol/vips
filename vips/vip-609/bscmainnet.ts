import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUMONE_ACM,
  ARBITRUMONE_DST_CHAIN_ID,
  ARBITRUMONE_ISOLATED_VTOKENS,
  ARBITRUMONE_NORMAL_TIMELOCK,
} from "./addresses/arbitrumone";
import {
  ETHEREUM_ACM,
  ETHEREUM_DST_CHAIN_ID,
  ETHEREUM_ISOLATED_VTOKENS,
  ETHEREUM_NORMAL_TIMELOCK,
} from "./addresses/ethereum";

interface NetworkConfig {
  name: string;
  acm: string;
  normalTimelock: string;
  dstChainId: number;
  isolatedVTokens: string[];
}

const NETWORKS: NetworkConfig[] = [
  {
    name: "Ethereum",
    acm: ETHEREUM_ACM,
    normalTimelock: ETHEREUM_NORMAL_TIMELOCK,
    dstChainId: ETHEREUM_DST_CHAIN_ID,
    isolatedVTokens: ETHEREUM_ISOLATED_VTOKENS,
  },
  {
    name: "Arbitrum",
    acm: ARBITRUMONE_ACM,
    normalTimelock: ARBITRUMONE_NORMAL_TIMELOCK,
    dstChainId: ARBITRUMONE_DST_CHAIN_ID,
    isolatedVTokens: ARBITRUMONE_ISOLATED_VTOKENS,
  },
];

export const vip609 = () => {
  const meta = {
    version: "v2",
    title: "VIP-609 [Ethereum & Arbitrum One] Complete syncCash Initialization for Isolated Pool Markets",
    description: `This proposal completes the VToken inflation attack fix initiated by VIP-601 and VIP-602 by calling syncCash() on all remaining isolated pool markets on Ethereum and Arbitrum One. VIP-601 and VIP-602 patched the vulnerability by upgrading the VToken beacon and initializing internalCash via syncCash(), but only for core pool markets across the 7 non-BNB chains. Isolated pool markets on Ethereum and Arbitrum One were not covered by those proposals and require syncCash() to be called to bring internalCash in line with each VToken's actual underlying token balance.

No beacon upgrade is required. VIP-602's beacon upgrade applies to all VToken proxies on each network, as core and isolated pools share the same beacon. This VIP only grants syncCash() permission to the Normal Timelock via the Access Control Manager (ACM) and calls syncCash() for each outstanding isolated pool VToken.

This is a maintenance-only action targeting deprecated isolated pool markets — it introduces no new features and has no impact on existing services or user funds.

#### Proposed Changes

1. **Ethereum — Grant syncCash() Permission and Initialize 15 Isolated Pool VTokens**
For each of the 15 isolated pool VTokens across the Curve Pool, Liquid Staked ETH Pool, and Ethena Pool on Ethereum:

Then, for each VToken:
- **Contract**: Access Control Manager
- **Function**: giveCallPermission(address,string,address)
- **Parameters**: VToken address, "syncCash()", Normal Timelock address
- **Effect**: Grants the Normal Timelock permission to call syncCash() on each isolated pool VToken
- **Function**: syncCash()
- **Effect**: Sets internalCash = underlyingToken.balanceOf(vToken) for each of the 15 VTokens

2. **Arbitrum One — Grant syncCash() Permission and Initialize 3 Isolated Pool VTokens**
For each of the 3 isolated pool VTokens in the Liquid Staked ETH Pool on Arbitrum One:

Then, for each VToken:
- **Contract**: Access Control Manager
- **Function**: giveCallPermission(address,string,address)
- **Parameters**: VToken address, "syncCash()", Normal Timelock address
- **Effect**: Grants the Normal Timelock permission to call syncCash() on each isolated pool VToken
- **Function**: syncCash()
- **Effect**: Sets internalCash = underlyingToken.balanceOf(vToken) for each of the 3 VTokens

#### Summary

If approved, this VIP will:
- Call syncCash() on **15 Ethereum isolated pool VTokens** across the Curve, Liquid Staked ETH, and Ethena pools
- Call syncCash() on **3 Arbitrum One isolated pool VTokens** in the Liquid Staked ETH pool
- Fully initialize internalCash for all remaining isolated pool markets on non-BNB chains
- Complete the VToken inflation attack remediation started by VIP-601 and VIP-602

#### References

- GitHub PR: [https://github.com/VenusProtocol/vips/pull/693](https://github.com/VenusProtocol/vips/pull/693)
- Related VIPs: VIP-601, VIP-602

#### Voting options

- For - Execute this proposal
- Against - Do not execute this proposal
- Abstain - Indifferent to execution`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    NETWORKS.flatMap(({ acm, normalTimelock, dstChainId, isolatedVTokens }) => [
      // Grant syncCash() permission to the Normal Timelock for each isolated pool VToken
      ...isolatedVTokens.map(vToken => ({
        target: acm,
        signature: "giveCallPermission(address,string,address)",
        params: [vToken, "syncCash()", normalTimelock],
        dstChainId,
      })),
      // Call syncCash on each isolated pool VToken to initialize internalCash
      ...isolatedVTokens.map(vToken => ({
        target: vToken,
        signature: "syncCash()",
        params: [],
        dstChainId,
      })),
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip609;
