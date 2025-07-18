import { ethers } from "hardhat";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const rewardDistributors = [
  {
    address: "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894",
    markets: [
      "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
      "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
      "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
      "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
      "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
    ],
    chainId: LzChainId.zksyncmainnet,
  },
  {
    address: "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a",
    markets: [
      "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
      "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
      "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
      "0xaDa57840B372D4c28623E87FC175dE8490792811",
      "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
    ],
    chainId: LzChainId.arbitrumone,
  },
  {
    address: "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
    markets: ["0x39D6d13Ea59548637104E40e729E4aABE27FE106"],
    chainId: LzChainId.arbitrumone,
  },
  {
    address: "0x886767B62C7ACD601672607373048FFD96Cf27B2",
    markets: [
      "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
      "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
      "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
      "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
    ],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x1e25CF968f12850003Db17E0Dba32108509C4359",
    markets: ["0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2"],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb",
    markets: ["0xb953f92b9f759d97d2f2dec10a8a3cf75fce3a95", "0xc219bc179c7cdb37eacb03f993f9fdc2495e3374"],
    chainId: LzChainId.unichainmainnet,
  },
];

export const vip533 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-533 XVS Emissions Strategy Update",
    description: `Following the community proposal [XVS Emissions Strategy Update](https://community.venus.io/t/xvs-emissions-strategy-update/5224), and the [associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x8dfb4ec02f6980535acf8235422ad1cefcc385eecab44f610882689a745aa26f), if passed, this VIP will perform the following actions:

- Reduce XVS emissions on Ethereum, from 12,141 to 0 XVS/month
- Reduce XVS emissions on Arbitrum One, from 3,702 to 0 XVS/month
- Reduce XVS emissions on ZKSync Era, from 5,148 to 0 XVS/month
- Reduce XVS emissions on Unichain, from 12,000 to 0 XVS/month
- Maintain XVS emissions on BNB Chain only

This proposal updates the XVS emissions strategy for Q3 2025 by maintaining emissions on BNB Chain while pausing emissions on Ethereum, Arbitrum, ZKSync, and Unichain. The goal is to review and optimize the allocation of XVS incentives to drive sustainable protocol activity growth.

#### Cross-Chain Emissions Review

Venus has expanded to multiple chains, accompanied by emissions to help bootstrap activity. While emissions remain a powerful tool for incentivizing usage and growth, it's important to regularly assess their impact and adapt based on performance.

This proposal **maintains the current emissions structure on BNB Chain**, where the majority of protocol activity and revenue is concentrated, and where the XVS market continues to see strong supplier participation. The current emission rate of 675 XVS/month (2,025 XVS/quarter) will remain unchanged and fully allocated to suppliers.

On Ethereum, Arbitrum, ZKSync, and Unichain, XVS emissions have not yet driven the level of user engagement and lending activity expected. As a result, we propose to **pause all emissions on these chains** to enable a full review of the current mechanisms and explore alternative strategies that may generate higher impact.

This pause is projected to generate **approximately $220,000 in savings for Q3**, which can be redeployed into high-impact initiatives in the near future. A strategic reassessment will be conducted during this period to optimize incentive structures going forward, ensuring that future emissions are strategically deployed to grow TVL, increase protocol revenue and enhance the value proposition of Venus across chains.

- BNB Chain: Maintain 2,025 XVS per quarter on XVS market
- Ethereum: Reduce speed from 12,141 to 0 XVS/month
- Arbitrum One: Reduce speed from 3,702 to 0 XVS/month
- ZKSync Era: Reduce speed from 5,148 to 0 XVS/month
- Unichain: Reduce speed from 12,000 to 0 XVS/month

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/589)
- RewardsDistributor contracts involved in the update:
    - Ethereum Mainnet:
        - [RewardsDistributor_Core_2](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
        - [RewardsDistributor_Liquid Staked ETH_3](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)
    - Arbitrum one
        - [RewardsDistributor_Core_0](https://arbiscan.io/address/0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a)
        - [RewardsDistributor_Liquid Staked ETH_0](https://arbiscan.io/address/0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D)
    - ZKsync Era: [RewardsDistributor_Core_0](https://explorer.zksync.io/address/0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894)
    - Unichain: [RewardsDistributor_Core_0](https://unichain.blockscout.com/address/0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb)
- Previous proposal to adjust XVS emissions on BNB Chain, Ethereum, Arbitrum One and ZKSync Era:
    - [VIP-471 Emissions Adjustments Across All Chains](https://app.venus.io/#/governance/proposal/471?chainId=56)
    - [XVS Emissions Adjustments Across All Chains](https://community.venus.io/t/xvs-emissions-adjustment-across-all-chains/4995)
- Previous proposal setting the XVS emissions on Unichain:
    - [VIP-457 [Unichain] XVS Rewards on Unichain](https://app.venus.io/#/governance/proposal/457?chainId=56)
    - [Unichain XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...rewardDistributors.flatMap(rd => {
        return rd.markets.map(market => ({
          target: rd.address,
          signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
          params: [[market], [0], [0]],
          dstChainId: rd.chainId,
        }));
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip533;
