import { ethers } from "hardhat";
import { Command, LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ZKSYNC_SECONDS_PER_MONTH = 2592000;
export const ARBITRUM_SECONDS_PER_MONTH = 2592000;
export const ETHEREUM_BLOCKS_PER_MONTH = 216000;
export const BSC_BLOCKS_PER_MONTH = 864000;

export const ZKSYNC_XVS_REWARDS_DISTRIBUTOR = "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894";
export const ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE = "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a";
export const ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST = "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D";

export const ZKSYNC_XVS_VAULT = "0xbbB3C88192a5B0DB759229BeF49DcD1f168F326F";
export const ETHEREUM_XVS_VAULT = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
export const ARBITRUM_XVS_VAULT = "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4";
export const BSC_XVS_VAULT = "0x051100480289e704d20e9DB4804837068f3f9204";

export const ZKSYNC_XVS = "0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A";
export const ETHEREUM_XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const ARBITRUM_XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const BSC_XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const ZKSYNC_XVS_VAULT_REWARD = "405092592592592";
export const ETHEREUM_XVS_VAULT_REWARD = "23333333333333333";
export const ARBITRUM_XVS_VAULT_REWARD = "405092592592592";

export const BSC_XVS_MARKET = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const BSC_XVS_MARKET_SUPPLY_REWARD_MONTHLY = ethers.utils.parseEther("900");
export const BSC_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const BSC_VAI_VAULT_RATE = "3255787037037037";
export const BSC_XVS_VAULT_RATE = "15312500000000000";

export const emissions = [
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("630"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x697a70779C1A03Ba2BD28b7627a902BFf831b616", // ZK
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("600"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8", // WETH
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("600"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719", // WBTC
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("450"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46", // USDT
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("900"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D", // USDC.e
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("475"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65", // WETH
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("949"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d", // WBTC
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("1709"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E", // USDT
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("1709"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb", // USDC
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("3713"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a (slightly) change
    vToken: "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2", // WETH
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("239"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6", // ARB
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("239"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0", // WETH
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("319"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: "0xaDa57840B372D4c28623E87FC175dE8490792811", // WBTC
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("479"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD", // USDT
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("479"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: "0x7D8609f8da70fF9027E9bc5229Af4F6727662707", // USDC
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("1020"),
    isSupplierAllocation: true, // no changes w.r.t. the current speeds
    isBorrowerAllocation: false, // it implies a change
    vToken: "0x39D6d13Ea59548637104E40e729E4aABE27FE106", // WETH
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("0"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: false, // no changes w.r.t. the current speeds
    vToken: "0x9df6B5132135f14719696bBAe3C54BAb272fDb16", // wstETH
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("0"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: false, // no changes w.r.t. the current speeds
    vToken: "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88", // weETH
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
];

const commands = emissions
  .map(emission => {
    const speed = emission.newAllocation.div(emission.blocksOrSecondsPerMonth);
    return {
      target: emission.rewardsDistributor,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [emission.vToken],
        [emission.isSupplierAllocation ? speed : 0],
        [emission.isBorrowerAllocation ? speed : 0],
      ],
      dstChainId: emission.chainId,
    };
  })
  .reduce((accumulator: Command[], currentValue: Command) => {
    const command = accumulator.find(
      (it: any) => it.target == currentValue.target && it.dstChainId == currentValue.dstChainId,
    );
    if (!command) {
      accumulator.push(currentValue);
    } else {
      command.params[0].push(currentValue.params[0][0]);
      command.params[1].push(currentValue.params[1][0]);
      command.params[2].push(currentValue.params[2][0]);
    }
    return accumulator;
  }, []);

export const vip410 = () => {
  const meta = {
    version: "v2",
    title: "VIP-410 Emissions Adjustments Across All Chains",
    description: `#### Summary

Following the community proposal [Proposal: Emissions Adjustments Across All Chains](https://community.venus.io/t/proposal-emissions-adjustments-across-all-chains/4777), and the [associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x8033a801d152e88511475c117e114a3a2e4037d5a7252a2bea40e78a36b72d51), if passed, this VIP will perform the following actions:

- Adjust the XVS emissions on BNB Chain, Ethereum, Arbitrum one and ZKSync Era markets
- Reduce the XVS emissions in the XVS Vaults of the mentioned networks
- Reduce the XVS emissions in the VAI Vault on BNB Chain

The sum of the current emissions is 2,238.8 XVS/day, and after the change the daily emission of XVS in these networks will be 1,012.4 XVS/day (a 55% reduction).

#### Details

Specifically, the changes in the monthly XVS emissions are:

**BNB Chain.**

- Core pool
  - XVS. From 1,200 XVS/month to 900 XVS/month (100% for suppliers, and 0% for borrowers)
  - XVS Vault: from 18,900 XVS/month to 13,230 XVS/month
  - VAI Vault: from 3,750 XVS/month to 2,813 XVS/month

**Ethereum.**

- Core pool
  - WETH. From 633 XVS/month to 475 XVS/month (100% for suppliers, and 0% for borrowers)
  - WBTC. From 1,898 XVS/month to 949 XVS/month (100% for suppliers, and 0% for borrowers)
  - USDT. From 2,279 XVS/month to 1,709 XVS/month (0% for suppliers, and 100% for borrowers)
  - USDC. From 2,279 XVS/month to 1,709 XVS/month (0% for suppliers, and 100% for borrowers)
- Liquid Staked ETH pool
  - From 12,375 XVS/month to 3,713 XVS/month (100% for suppliers, and 0% for borrowers)
- XVS Vault: from 7,200 XVS/month to 5,040 XVS/month

**ZKSync Era.**

- Core pool
  - ZKSync. From 900 XVS/month to 630 XVS/month (100% for suppliers, and 0% for borrowers)
  - ETH. From 1,200 XVS/month to 600 XVS/month (100% for suppliers, and 0% for borrowers)
  - BTC. From 1,200 XVS/month to 600 XVS/month (100% for suppliers, and 0% for borrowers)
  - USDT. From 900 XVS/month to 450 XVS/month (0% for suppliers, and 100% for borrowers)
  - USDC.e. From 1,800 XVS/month to 900 XVS/month (0% for suppliers, and 100% for borrowers)
- XVS Vault: from 1,500 XVS/month to 1,050 XVS/month

**Arbitrum one.**

- Core pool
  - ARB. From 319 XVS/month to 239 XVS/month (100% for suppliers, and 0% for borrowers)
  - WETH. From 319 XVS/month to 239 XVS/month (100% for suppliers, and 0% for borrowers)
  - WBTC. From 638 XVS/month to 319 XVS/month (100% for suppliers, and 0% for borrowers)
  - USDT. From 638 XVS/month to 479 XVS/month (0% for suppliers, and 100% for borrowers)
  - USDC. From 638 XVS/month to 479 XVS/month (0% for suppliers, and 100% for borrowers)
- Liquid Staked ETH pool
  - WETH. From 3,400 XVS/month to 1,020 XVS/month (100% for suppliers, and 0% for borrowers)
  - wstETH. From 850 XVS/month to 0 XVS/month (0% for suppliers, and 0% for borrowers)
  - weETH. From 850 XVS/month to 0 XVS/month (0% for suppliers, and 0% for borrowers)
- XVS Vault: from 1,500 XVS/month to 1,050 XVS/month

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/443)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...commands,
      {
        target: ZKSYNC_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ZKSYNC_XVS, ZKSYNC_XVS_VAULT_REWARD],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ETHEREUM_XVS, ETHEREUM_XVS_VAULT_REWARD],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUM_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ARBITRUM_XVS, ARBITRUM_XVS_VAULT_REWARD],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: BSC_COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[BSC_XVS_MARKET], [BSC_XVS_MARKET_SUPPLY_REWARD_MONTHLY.div(BSC_BLOCKS_PER_MONTH)], [0]],
      },
      {
        target: BSC_COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [BSC_VAI_VAULT_RATE],
      },
      {
        target: BSC_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [BSC_XVS, BSC_XVS_VAULT_RATE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip410;
