import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const HAY_REWARDS_DISTRIBUTOR = "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const MARKET_BNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const MARKET_HAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";

export const vip169Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-169: Isolated Lending Pools: Configure Liquidity Mining",
    description: `**Summary**

If passed, this VIP will set the last block with rewards for the BNBx market in the Liquid Staked BNB pool, and the HAY market in the Stablecoins pool

**Description**

This VIP sets the last block with rewards for the BNBx market in the DeFi pool, and the HAY market in the Stablecoins pool. Rewards were enabled at block 32871078 in the [VIP-280](https://testnet-cf.venus.io/#/governance/proposal/280).

In [vBNBx_LiquidStakedBNB](https://testnet-cf.venus.io/#/isolated-pools/pool/0x596B11acAACF03217287939f88d63b51d3771704/market/0x644A149853E5507AdF3e682218b8AC86cdD62951), the last block with rewards will be 33735078. That means around 30 days (864,000 blocks) after being enabled.

In [vHAY_Stablecoins](https://testnet-cf.venus.io/#/isolated-pools/pool/0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B/market/0x170d3b2da05cc2124334240fb34ad1359e34c562), the last block with rewards will be 33677478. That means around 28 days (806,400 blocks) after being enabled.

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
        params: [[MARKET_HAY], ["33677478"], ["33677478"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [[MARKET_BNBx], ["33735078"], ["33735078"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
