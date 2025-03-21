import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { arbitrumone, ethereum, zksyncmainnet, bscmainnet } = NETWORK_ADDRESSES;

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

export const ZKSYNC_XVS_VAULT_REWARD = "283564814814814";
export const ETHEREUM_XVS_VAULT_REWARD = "16333333333333333";
export const ARBITRUM_XVS_VAULT_REWARD = "283564814814814";

export const BSC_XVS_MARKET = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const BSC_XVS_MARKET_SUPPLY_REWARD_MONTHLY = ethers.utils.parseEther("675");
export const BSC_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const BSC_VAI_VAULT_RATE = "2278935185185185";
export const BSC_XVS_VAULT_RATE = "45417824074074074";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const ZKSYNC_VZK = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
export const ZKSYNC_VWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
export const ZKSYNC_VWBTC = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
export const ZKSYNC_VUSDT = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
export const ZKSYNC_VUSDCe = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";

export const ARBITRUM_VARB = "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6";
export const ARBITRUM_VWETH = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const ARBITRUM_VWETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
export const ARBITRUM_VWBTC = "0xaDa57840B372D4c28623E87FC175dE8490792811";
export const ARBITRUM_VUSDT = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const ARBITRUM_VUSDC = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";

export const ETHEREUM_VWETH = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const ETHEREUM_VWETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const ETHEREUM_VWBTC = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const ETHEREUM_VUSDT = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const ETHEREUM_VUSDC = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";

export const ETHEREUM_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const ARBITRUM_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ZKSYNC_XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const TOTAL_XVS = parseUnits("35985", 18);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

export const emissions = [
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("441"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ZKSYNC_VZK, // ZK
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("300"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ZKSYNC_VWETH, // WETH
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("300"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ZKSYNC_VWBTC, // WBTC
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("225"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ZKSYNC_VUSDT, // USDT
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.zksyncmainnet,
    newAllocation: ethers.utils.parseEther("450"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ZKSYNC_VUSDCe, // USDC.e
    rewardsDistributor: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    blocksOrSecondsPerMonth: ZKSYNC_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("60"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ARBITRUM_VARB, // ARB
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("60"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ARBITRUM_VWETH, // WETH
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("160"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ARBITRUM_VWBTC, // WBTC
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("120"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ARBITRUM_VUSDT, // USDT
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("120"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ARBITRUM_VUSDC, // USDC
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.arbitrumone,
    newAllocation: ethers.utils.parseEther("714"),
    isSupplierAllocation: true, // no changes w.r.t. the current speeds
    isBorrowerAllocation: false, // it implies a change
    vToken: ARBITRUM_VWETH_LST, // WETH(LST)
    rewardsDistributor: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ARBITRUM_SECONDS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("119"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ETHEREUM_VWETH, // WETH
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("475"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a change
    vToken: ETHEREUM_VWBTC, // WBTC
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("427"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ETHEREUM_VUSDT, // USDT
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("427"),
    isSupplierAllocation: false, // it implies a change
    isBorrowerAllocation: true, // it implies a change
    vToken: ETHEREUM_VUSDC, // USDC
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
  },
  {
    chainId: LzChainId.ethereum,
    newAllocation: ethers.utils.parseEther("2599"),
    isSupplierAllocation: true, // it implies a change
    isBorrowerAllocation: false, // it implies a (slightly) change
    vToken: ETHEREUM_VWETH_LST, // WETH(LST)
    rewardsDistributor: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST,
    blocksOrSecondsPerMonth: ETHEREUM_BLOCKS_PER_MONTH,
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

export const ETHEREUM_TARGETS = [
  {
    target: ETHEREUM_XVS_STORE,
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("10584", 18),
    treasury: ethereum.VTREASURY,
  },
  {
    target: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("4344", 18),
    treasury: ethereum.VTREASURY,
  },
  {
    target: ETHEREUM_XVS_REWARDS_DISTRIBUTOR_LST,
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("7797", 18),
    treasury: ethereum.VTREASURY,
  },
];

export const ARBITRUM_ONE_TARGETS = [
  {
    target: ARBITRUM_XVS_STORE,
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("2205", 18),
    treasury: arbitrumone.VTREASURY,
  },
  {
    target: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_CORE,
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("1560", 18),
    treasury: arbitrumone.VTREASURY,
  },
  {
    target: ARBITRUM_XVS_REWARDS_DISTRIBUTOR_LST,
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("2142", 18),
    treasury: arbitrumone.VTREASURY,
  },
];

export const ZKSYNCMAINNET_TARGETS = [
  {
    target: ZKSYNC_XVS_STORE,
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("2205", 18),
    treasury: zksyncmainnet.VTREASURY,
  },
  {
    target: ZKSYNC_XVS_REWARDS_DISTRIBUTOR,
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("5148", 18),
    treasury: zksyncmainnet.VTREASURY,
  },
];

export const ETHEREUM_TOTAL_AMOUNT = parseUnits("22725", 18);
export const ARBITRUM_ONE_TOTAL_AMOUNT = parseUnits("5907", 18);
export const ZKSYNCMAINNET_TOTAL_AMOUNT = parseUnits("7353", 18);

export const vip471 = () => {
  const meta = {
    version: "v2",
    title: "VIP-469 Emissions Adjustments and Bridge XVS Tokens Across ZKSync, Arbitrum one, Ethereum and BNB Chains",
    description: "",
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
        target: ARBITRUM_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ARBITRUM_XVS, ARBITRUM_XVS_VAULT_REWARD],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ETHEREUM_XVS, ETHEREUM_XVS_VAULT_REWARD],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BSC_COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[BSC_XVS_MARKET], [BSC_XVS_MARKET_SUPPLY_REWARD_MONTHLY.div(BSC_BLOCKS_PER_MONTH)], [0]],
      },
      {
        target: BSC_XVS_VAULT,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [BSC_XVS, BSC_XVS_VAULT_RATE],
      },
      {
        target: BSC_COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [BSC_VAI_VAULT_RATE],
      },

      // Bridge XVS token
      {
        target: BSC_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, TOTAL_XVS],
      },
      {
        target: BSC_XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, ETHEREUM_TOTAL_AMOUNT.add(ARBITRUM_ONE_TOTAL_AMOUNT).add(ZKSYNCMAINNET_TOTAL_AMOUNT)],
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.ethereum,
          ethers.utils.defaultAbiCoder.encode(["address"], [ethereum.VTREASURY]),
          ETHEREUM_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [arbitrumone.VTREASURY]),
          ARBITRUM_ONE_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.zksyncmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [zksyncmainnet.VTREASURY]),
          ZKSYNCMAINNET_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      ...ETHEREUM_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, amount, target],
        dstChainId,
      })),
      ...ARBITRUM_ONE_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ARBITRUM_XVS, amount, target],
        dstChainId,
      })),
      ...ZKSYNCMAINNET_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ZKSYNC_XVS, amount, target],
        dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip471;
