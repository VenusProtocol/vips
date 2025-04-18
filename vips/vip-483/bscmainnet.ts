import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const BSCMAINNET_USDT = "0x55d398326f99059ff775485246999027b3197955";
export const BSCMAINNET_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const DEV_WALLET = "0x5e7bb1f600e42bc227755527895a282f782555ec";
export const USDT_TOKENS_AMOUNT = parseUnits("400000", 18);

export const vip483 = () => {
  const meta = {
    version: "v2",
    title: "VIP-483 Partial Liquidity Restoration for wUSDM on Venus ZKsync (1/2)",
    description: `If passed, this VIP will withdraw 400,000 USDT from the [Risk Fund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42) contract on BNB Chain to the [Development Team wallet](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec), which will convert them to [wUSDM](https://explorer.zksync.io/address/0xA900cbE7739c96D2B153a273953620A701d5442b) and transfer them to the [Venus Treasury on ZKSync Era](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599).

This is the prerequisite exposed in the community post "[Proposal: Partial Liquidity Restoration for wUSDM on Venus ZKsync](https://community.venus.io/t/proposal-partial-liquidity-restoration-for-wusdm-on-venus-zksync/5013)". In a different VIP, these funds will be used to liquidate some accounts on ZKSync Era, and inject liquidity into the [Venus wUSDM market](https://explorer.zksync.io/address/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c) of that network.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/529)
- Community post "[Proposal: Partial Liquidity Restoration for wUSDM on Venus ZKsync](https://community.venus.io/t/proposal-partial-liquidity-restoration-for-wusdm-on-venus-zksync/5013)"
- Snapshot "[Proposal: Partial Liquidity Restoration for wUSDM on Venus ZKsync](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf23c591bdabf587669c1ec273201d61664779cc3615ea1b5f90765ce1e66824a)"`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [BSCMAINNET_USDT, BSCMAINNET_CORE_COMPTROLLER, DEV_WALLET, USDT_TOKENS_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip483;
