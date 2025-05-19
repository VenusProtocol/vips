import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_ARBITRUM = "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007";
export const CHAINLINK_ORACLE_ARBITRUM = "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113";
export const REDSTONE_ORACLE_ARBITRUM = "0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6";
export const BOUND_VALIDATOR_ARBITRUM = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const DEFAULT_PROXY_ADMIN_ARBITRUM = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM = "0x6B85803c8a2FE134AC1964879Bafd319E1279ff8";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM = "0x4256f572B8738126466e864D453BCCD0281b3C6C";
export const REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM = "0x5cfCC7F674DbC64f21E66FdDE921B4467aB79aB2";
export const BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM = "0x20Fb908a61C000431C4FCb4A51FcB67b73a8A526";
export const weETH_ORACLE_ARBITRUM = "0x0afD33490fBcF537ede00F9Cc4607230bBf65774";
export const weETH_ARBITRUM = "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe";
export const wstETHOracle_ARBITRUM = "0x17a5596DF05c7bfB2280D5B9cCcDAf711e957Ed4";
export const wstETH_ARBITRUM = "0x5979D7b546E38E414F7E9822514be443A4800529";
export const ACM_ARBITRUM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const NORMAL_TIMELOCK_ARBITRUM = "0x4b94589Cc23F618687790036726f744D602c4017";
export const FASTTRACK_TIMELOCK_ARBITRUM = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const CRITICAL_TIMELOCK_ARBITRUM = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const weETH_Initial_Exchange_Rate = parseUnits("1.067789208571946221", 18);
export const wstETH_Initial_Exchange_Rate = parseUnits("1.203073466794064368", 18);


export const RESILIENT_ORACLE_ZKSYNC = "0xDe564a4C887d5ad315a19a96DC81991c98b12182";
export const CHAINLINK_ORACLE_ZKSYNC = "0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5";
export const REDSTONE_ORACLE_ZKSYNC = "0xFa1e65e714CDfefDC9729130496AB5b5f3708fdA";
export const BOUND_VALIDATOR_ZKSYNC = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const DEFAULT_PROXY_ADMIN_ZKSYNC = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";
export const RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC = "0x9d04692c4f86a5fa52a5dd02F61a9cc9F685B9EB";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC = "0xb20d1B03C62D2c8Dc150298b8D151AF022068347";
export const REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC = "0x3D45B3025c9Aa5c669B6F625592cd70b5E1F3F87";
export const BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC = "0xc79fE34320903dA7a19E6335417C7131293844ED";
export const wUSDM_ORACLE_ZKSYNC = "0x22cE94e302c8C80a6C2dCfa9Da6c5286e9f28692";
export const wUSDM_ZKSYNC = "0xA900cbE7739c96D2B153a273953620A701d5442b";
export const wstETHOracle_ZKSYNC = "0x2DAaeb94E19145BA7633cAB2C38c76fD8c493198";
export const wstETH_ZKSYNC = "0x703b52F2b28fEbcB60E1372858AF5b18849FE867";
export const zkETHOracle_ZKSYNC = "0x407dE1229BCBD2Ec876d063F3F93c4D8a38bd81a";
export const zkETH_ZKSYNC = "0xb72207E1FB50f341415999732A20B6D25d8127aa";
export const ACM_ZKSYNC = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const NORMAL_TIMELOCK_ZKSYNC = "0x093565Bc20AA326F4209eBaF3a26089272627613";
export const FASTTRACK_TIMELOCK_ZKSYNC = "0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9";
export const CRITICAL_TIMELOCK_ZKSYNC = "0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c";
export const zkETH_Initial_Exchange_Rate = parseUnits("1.011815149704219045", 18);
export const wUSDM_Initial_Exchange_Rate = parseUnits("1.077939040602540747", 18);

export const DAYS_30 = 30 * 24 * 60 * 60;
export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};

export const vip499 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ARBITRUM, RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ARBITRUM, CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ARBITRUM, REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ARBITRUM, BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(weETH_Initial_Exchange_Rate, BigNumber.from("44")),
          1747682525,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.053", 18), DAYS_30],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setSnapshotGap(uint256)",
        params: [parseUnits("0.044", 18)],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH_ARBITRUM,
            [weETH_ORACLE_ARBITRUM, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: wstETHOracle_ARBITRUM,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("55")),
          1747682525,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: wstETHOracle_ARBITRUM,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ARBITRUM,
            [wstETHOracle_ARBITRUM, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ZKSYNC, RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ZKSYNC, CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ZKSYNC, REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ZKSYNC, BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM_ORACLE_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wUSDM_Initial_Exchange_Rate, BigNumber.from("49")),
          1746787630,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM_ORACLE_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.061", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wUSDM_ZKSYNC,
            [wUSDM_ORACLE_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wstETHOracle_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("55")),
          1747682525,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wstETHOracle_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ZKSYNC,
            [wstETHOracle_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zkETHOracle_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(zkETH_Initial_Exchange_Rate, BigNumber.from("44")),
          1746787651,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zkETHOracle_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.053", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            zkETH_ZKSYNC,
            [zkETHOracle_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip499;
