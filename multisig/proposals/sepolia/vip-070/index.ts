import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const PUFETH = "0x6D9f78b57AEeB0543a3c3B32Cc038bFB14a4bA68";
const PUFETH_VTOKEN = "0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356";
const LST_ETH_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const REDUCE_RESERVES_BLOCK_DELTA = "7200";

const { POOL_REGISTRY, VTREASURY, REDSTONE_ORACLE, RESILIENT_ORACLE } = sepolia;

export const marketSpec = {
  vToken: {
    address: PUFETH_VTOKEN,
    name: "Venus pufETH (Liquid Staked ETH)",
    symbol: "vpufETH_LiquidStakedETH",
    underlying: {
      address: PUFETH,
      decimals: 18,
      symbol: "pufETH",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: LST_ETH_COMPTROLLER,
  },
  interestRateModel: {
    address: "0x9404B140E5384326ef108B089EBDa71a7f23Cd55",
    base: "0",
    multiplier: "0.045",
    jump: "2",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("5", 18),
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("3000", 18),
    borrowCap: parseUnits("300", 18),
    collateralFactor: parseUnits("0.8", 18),
    liquidationThreshold: parseUnits("0.85", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.01", 18),
  },
};

const pufETH_ONE_JUMP_REDSTONE_ORACLE = "0xB6aA35247097a2711CF4941DECD00b858124d959";

export const vip070 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [marketSpec.vToken.underlying.address, parseUnits("1", 18)],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          marketSpec.vToken.underlying.address,
          [pufETH_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },

    // Add Market
    {
      target: marketSpec.vToken.underlying.address,
      signature: "faucet(uint256)",
      params: [marketSpec.initialSupply.amount],
    },
    {
      target: marketSpec.vToken.underlying.address,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, marketSpec.initialSupply.amount],
    },
    {
      target: marketSpec.vToken.address,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVES_BLOCK_DELTA],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          marketSpec.vToken.address,
          marketSpec.riskParameters.collateralFactor,
          marketSpec.riskParameters.liquidationThreshold,
          marketSpec.initialSupply.amount,
          marketSpec.initialSupply.vTokenReceiver,
          marketSpec.riskParameters.supplyCap,
          marketSpec.riskParameters.borrowCap,
        ],
      ],
    },
    {
      target: marketSpec.vToken.underlying.address,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: marketSpec.vToken.address,
      signature: "setProtocolSeizeShare(uint256)",
      params: [marketSpec.riskParameters.protocolSeizeShare],
    },
  ]);
};

export default vip070;
