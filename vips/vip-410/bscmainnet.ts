import { ethers } from "hardhat";
import { LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ZKSYNC_BLOCKS_PER_MONTH = 2592000;
export const ARBITRUM_BLOCKS_PER_MONTH = 2592000;
export const ETHEREUM_BLOCKS_PER_MONTH = 216000;
export const BSC_BLOCKS_PER_MONTH = 876000;

export const ZKSYNC_XVS_REWARDS_DISTRIBUTOR = "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894";
export const ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";
export const ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE = "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a";
export const ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST = "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D";

export const ZKSYNC_XVS_VAULT = "0xbbB3C88192a5B0DB759229BeF49DcD1f168F326F";
export const ETHEREYM_XVS_VAULT = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
export const ARBITRUM_XVS_VAULT = "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4";
export const BSC_XVS_VAULT = "0x051100480289e704d20e9DB4804837068f3f9204";

export const ZKSYNC_XVS = "0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A";
export const ETHEREYM_XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const ARBITRUM_XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const BSC_XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const ZKSYNC_XVS_VAULT_REWARD = "405092592592592";
export const ETHEREYM_XVS_VAULT_REWARD = "23333333333333333";
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
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksPerMonth: ZKSYNC_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("600"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksPerMonth: ZKSYNC_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("600"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksPerMonth: ZKSYNC_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("450"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksPerMonth: ZKSYNC_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("900"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksPerMonth: ZKSYNC_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("475"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("949"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("1709"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("1709"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("3713"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2",
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("239"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("239"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("319"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0xaDa57840B372D4c28623E87FC175dE8490792811",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("479"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("479"),
    isSupplierAllocation: false,
    isBorrowerAllocation: true,
    vToken: "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("1020"),
    isSupplierAllocation: true,
    isBorrowerAllocation: false,
    vToken: "0x39D6d13Ea59548637104E40e729E4aABE27FE106",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("0"),
    isSupplierAllocation: false,
    isBorrowerAllocation: false,
    vToken: "0x9df6B5132135f14719696bBAe3C54BAb272fDb16",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("0"),
    isSupplierAllocation: false,
    isBorrowerAllocation: false,
    vToken: "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88",
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksPerMonth: ARBITRUM_BLOCKS_PER_MONTH,
  },
];

const commands = emissions.map(emission => {
  const speed = emission.newAllocation.div(emission.blocksPerMonth);
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
});

export const vip410 = () => {
  const meta = {
    version: "v2",
    title: "VIP-410 Market Emission Adjustment",
    description: ``,
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
        target: ETHEREYM_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ETHEREYM_XVS, ETHEREYM_XVS_VAULT_REWARD],
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
