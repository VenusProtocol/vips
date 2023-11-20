import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

export const vip169 = () => {
  const meta = {
    version: "v2",
    title: "VIP-169: Isolated Lending Pools: Configure Liquidity Mining",
    description: `**Summary**

If passed, this VIP will set the last block with rewards for the BNBx market in the Liquid Staked BNB pool, and the HAY market in the Stablecoins pool

**Description**

This VIP sets the last block with rewards for the BNBx market in the DeFi pool, and the HAY market in the Stablecoins pool. Rewards were enabled at block 31394389 in the [VIP-163](https://app.venus.io/#/governance/proposal/163).

In [vBNBx_LiquidStakedBNB](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791), the last block with rewards will be 32258389. That means around 30 days (864,000 blocks) after being enabled.

In [vHAY_Stablecoins](https://app.venus.io/#/isolated-pools/pool/0x94c1495cD4c557f1560Cbd68EAB0d197e6291571/market/0xCa2D81AA7C09A1a025De797600A7081146dceEd9), the last block with rewards will be 32200789. That means around 28 days (806,400 blocks) after being enabled.

Simulation of the VIP: [https://github.com/VenusProtocol/vips/pull/70](https://github.com/VenusProtocol/vips/pull/70)`,
    forDescription: "Process to configure Liquidity Mining",
    againstDescription: "Defer configuration of Liquidity Mining",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_HAY], ["32200789"], ["32200789"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_BNBx], ["32258389"], ["32258389"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
