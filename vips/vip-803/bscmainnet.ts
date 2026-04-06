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

export const vip803 = () => {
  const meta = {
    version: "v2",
    title: "VIP-803 [Non-BNB Chain] syncCash for Isolated Pool Markets",
    description: `Following VIP-601 and VIP-602, which granted permissions and called syncCash() on all core pool markets across the seven non-BNB Chain Venus deployments, this VIP completes the internalCash initialization by targeting the remaining isolated pool markets on Ethereum and Arbitrum One.

The root cause of the VToken inflation attack vulnerability is that _getCashPrior() previously returned IERC20(underlying).balanceOf(address(this)), allowing any party to artificially inflate the reported cash — and therefore the exchange rate — by transferring tokens directly to a VToken contract without minting shares.

The fix (deployed in VIP-602) replaced this with an internalCash storage variable. The VToken beacon upgrade in VIP-602 applies to all VToken proxies on each network (both core and isolated pools), so isolated pool VTokens already have the new implementation. However, syncCash() was only called for core pool markets. Isolated pool markets still have internalCash uninitialized at zero.

#### Changes

**1. Grant syncCash() permission to the Normal Timelock for each isolated pool VToken on Ethereum and Arbitrum One**

- **Function**: AccessControlManager.giveCallPermission(vToken, "syncCash()", normalTimelock)
- **Networks**: Ethereum Mainnet (15 VTokens across Curve, Liquid Staked ETH, and Ethena pools), Arbitrum One (3 VTokens in the Liquid Staked ETH pool)

**2. Initialize internalCash via syncCash() on all isolated pool markets**

- **Function**: syncCash()
- **Caller**: ACM-authorized governance timelock (after permission granted in step 1)
- **Effect**: Sets internalCash to the current real underlying balance, completing the security patch for all isolated pool VToken markets

#### Affected Pools

**Ethereum Mainnet:**
- Curve Pool (2 VTokens): vcrvUSD, vCRV
- Liquid Staked ETH Pool (9 VTokens): vezETH, vPT-weETH-26DEC2024, vrsETH, vsfrxETH, vWETH, vwstETH, vweETH, vweETHs, vpufETH
- Ethena Pool (4 VTokens): vPT_USDe_27MAR2025, vPT_sUSDE_27MAR2025, vUSDC, vsUSDe

**Arbitrum One:**
- Liquid Staked ETH Pool (3 VTokens): vWETH, vweETH, vwstETH

#### Summary

If approved, this VIP will:
- Grant syncCash() call permissions to the Normal Timelock for all 15 Ethereum isolated pool VToken markets and all 3 Arbitrum One isolated pool VToken markets
- Call syncCash() on each market to initialize internalCash to the real underlying balance, completing the VToken inflation attack patch across all Venus isolated pool deployments on non-BNB chains

#### References

- GitHub PR (Isolated Pools patch): [https://github.com/VenusProtocol/isolated-pools/pull/551](https://github.com/VenusProtocol/isolated-pools/pull/551)
- VIP-601 (permission grant for core pools): governance proposal #601
- VIP-602 (beacon upgrade + syncCash for core pools): governance proposal #602

**Voting options**
- For - I agree that Venus Protocol should proceed with this proposal
- Against - I do not think that Venus Protocol should proceed with this proposal
- Abstain - I am indifferent to whether Venus Protocol proceeds or not`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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

export default vip803;
