import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNCMAINNET_COMPTROLLER_BEACON = "0x0221415aF47FD261dD39B72018423dADe5d937c5";
export const ZKSYNC_COMPTROLLER_IMPL = "0xB2B58B15667e39dc09A0e29f1863eee7FD495541";
export const ZKSYNC_TEMP_COMPTROLLER_IMPL = "0x729Fe6E68bE6e272410922A0F2dB1e7980257f80";
export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const WUSDM_LIQUIDATOR = "0x0192fFeFb1dddB9d30afcCCb12F60CEaaD490807";
export const WUSDM = "0xA900cbE7739c96D2B153a273953620A701d5442b";
export const WUSDM_AMOUNT = parseUnits("370732.56284", 18);

const { VTREASURY } = NETWORK_ADDRESSES["zksyncmainnet"];

export const vip502 = () => {
  const meta = {
    version: "v2",
    title: "VIP-502 [ZKsync] Partial Liquidity Restoration for wUSDM on Venus ZKsync (2/2)",
    description: `#### Summary

If passed, this VIP will perform the plan described in the Community proposal “[Proposal: Partial Liquidity Restoration for wUSDM on Venus ZKsync](https://community.venus.io/t/proposal-partial-liquidity-restoration-for-wusdm-on-venus-zksync/5013)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf23c591bdabf587669c1ec273201d61664779cc3615ea1b5f90765ce1e66824a):

1. inject [wUSDM](https://explorer.zksync.io/token/0xA900cbE7739c96D2B153a273953620A701d5442b) liquidity into the Venus market ($400K)
2. borrow [WETH](https://explorer.zksync.io/token/0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91), [USDT](https://explorer.zksync.io/address/0x493257fd37edb34451f62edf8d2a0c418852ba4c) and [USDC.e](https://explorer.zksync.io/token/0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4)
3. liquidate wallets using wUSDM as collateral
4. repay part of the pending bad debt on behalf of the debtors

Legit suppliers of wUSDM will be able to withdraw their funds, using the injected liquidity.

An auxiliary contract, WUSDMLiquidator, will be used to perform the whole plan in a single transaction. This contract will inject 370,732 wUSDM tokens (around $400K) into the [wUSDM Venus market](https://app.venus.io/#/core-pool/market/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c?chainId=324). These wUSDM tokens are already available in the [Venus Treasury on ZKsync](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599), provided in the context of the [VIP-483](https://app.venus.io/#/governance/proposal/483?chainId=56).

The collected liquidation fee will be around $35K, transferred to the WUSDMLiquidator (Venus Governance is the owner of this contract). The total repayment will be around $60K.

#### Description

Accounts considered by this VIP (identified in the [Post-Mortem: wUSDM Donation Attack on Venus ZkSync](https://community.venus.io/t/post-mortem-wusdm-donation-attack-on-venus-zksync/5004)):

- Account 2: [0x4C0e4B3e6c5756fb31886a0A01079701ffEC0561](https://debank.com/profile/0x4C0e4B3e6c5756fb31886a0A01079701ffEC0561)
    - Collateral in wUSDM, debt in WETH
- Account 3: [0x924EDEd3D010b3F20009b872183eec48D0111265](https://debank.com/profile/0x924EDEd3D010b3F20009b872183eec48D0111265)
    - Collateral in wUSDM, debt in USDT and USDC.e
- Account 4: [0x2B379d8c90e02016658aD00ba2566F55E814C369](https://debank.com/profile/0x2B379d8c90e02016658aD00ba2566F55E814C369)
    - Collateral in wUSDM, debt in USDT and USDC.e
- Account 5: [0xfffAB9120d9Df39EEa07063F6465a0aA45a80C52](https://debank.com/profile/0xfffAB9120d9Df39EEa07063F6465a0aA45a80C52)
    - Debt in USDT and USDC.e

Account 1 ([0x68c8020a052d5061760e2abf5726d59d4ebe3506](https://debank.com/profile/0x68c8020a052d5061760e2abf5726d59d4ebe3506)), the main beneficiary of the attack, won’t be considered by this VIP (there won’t be any repayment or liquidation affecting this account).

The specific sequence of actions performed by this VIP is:

1. Temporary upgrade of the Comptroller, to allow Close Factors equal to 100% (that would allow the WUSDMLiquidator contract to liquidate 100% of the debts)
2. Grant special permissions to the Auxiliary contract, to temporarily:
    1. resume the wUSDM market
    2. set the Close Factor to 100%
    3. set the Collateral Factor of vwUSDM equal to the Liquidation Threshold
    4. set to 0% the liquidation bonus for the protocol in the Core pool
3. Execute the plan embedded in the WUSDMLiquidator contract:
    1. inject wUSDM liquidity into the Venus market (370,732 wUSDM)
    2. borrow WETH, USDT and USDC.e
    3. liquidate wallets using wUSDM as collateral (”Accounts 2-4”)
    4. repay the pending bad debt on behalf of Accounts 3-5
4. Remove permissions from the WUSDMLiquidator contract granted in step 2, restore the original values in the parameters, and restore the original implementation of the Comptroller

After the VIP execution, the WUSDMLiquidator contract will have a total debt of around $455K, defined in WETH, USDC.e and USDT, and a total collateral of around $789K in wUSDM. The health factor would be around 1.35

The USD values included in this VIP consider the token prices on May 26th, 2025.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the execution of the described plan

#### Audit reports

- [Certik audit audit report (2025/04/29)](https://github.com/VenusProtocol/isolated-pools/blob/f2043d3eaba06e10feb61fc0dfcba5160b4ea98a/audits/134_wusdmLiquidator_certik_20250429.pdf)
- [Quantstamp audit report (2025/05/23)](https://github.com/VenusProtocol/isolated-pools/blob/f2043d3eaba06e10feb61fc0dfcba5160b4ea98a/audits/135_wusdmLiquidator_quantstamp_20250523.pdf)
- [Fairyproof audit report (2025/05/08)](https://github.com/VenusProtocol/isolated-pools/blob/f2043d3eaba06e10feb61fc0dfcba5160b4ea98a/audits/136_wusdmLiquidator_fairyproof_20250508.pdf)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/549)
- [VIP-483 Partial Liquidity Restoration for wUSDM on Venus ZKsync (1/2)](https://app.venus.io/#/governance/proposal/483?chainId=56)
- [Source code of the WUSDMLiquidator](https://github.com/VenusProtocol/isolated-pools/pull/517)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      { target: WUSDM_LIQUIDATOR, signature: "acceptOwnership()", params: [], dstChainId: LzChainId.zksyncmainnet },
      {
        target: ZKSYNCMAINNET_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [ZKSYNC_TEMP_COMPTROLLER_IMPL],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [WUSDM, WUSDM_AMOUNT, WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: WUSDM_LIQUIDATOR,
        signature: "run()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [ZKSYNC_COMPTROLLER_IMPL],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip502;
