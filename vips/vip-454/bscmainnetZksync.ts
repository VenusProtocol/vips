import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, NORMAL_TIMELOCK, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const wstETH_ONE_JUMP_ORACLE = "0xd2b4352A3C1C452D9D4D11B4F19e28476128798f";
export const vTokenReceiverWstETH = "0x65B05f4fCa066316383b0FE196C76C873a4dFD02";
export const CHAINLINK_WSTETH_FEED = "0x24a0C9404101A8d7497676BE12F10aEa356bAC28";
export const CHAINLINK_WETH_FEED = "0x6D41d1dc818112880b40e26BD6FD347E41008eDA";
export const STALE_PERIOD = 24 * 365 * 60 * 60; // 1 Year

// Core Pool configuration
export const token = {
  wstETH: {
    address: "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
    decimals: 18,
    symbol: "wstETH",
  },
  WETH: {
    address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    decimals: 18,
    symbol: "WETH",
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const newMarket = {
  vToken: {
    address: "0x03CAd66259f7F34EE075f8B62D133563D249eDa4",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token["wstETH"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.71", 18),
    liquidationThreshold: parseUnits("0.76", 18),
    supplyCap: parseUnits("350", 18),
    borrowCap: parseUnits("35", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2.5", 18),
    vTokenReceiver: vTokenReceiverWstETH,
    vTokensToBurn: parseUnits("0.0037", 8), // Approximately $10
  },
  interestRateModel: {
    address: "0x42053cb8Ee2cBbfCEDF423C79A50CF56c9C9424f",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

const vip454 = () => {
  const meta = {
    version: "v2",
    title: "VIP-454 [Zksync] New wstETH market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[token["wstETH"].address, CHAINLINK_WSTETH_FEED, STALE_PERIOD]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token["wstETH"].address,
            [wstETH_ONE_JUMP_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: newMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [token["wstETH"].address, newMarket.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarket.vToken.address,
            newMarket.riskParameters.collateralFactor,
            newMarket.riskParameters.liquidationThreshold,
            newMarket.initialSupply.amount,
            newMarket.initialSupply.vTokenReceiver,
            newMarket.riskParameters.supplyCap,
            newMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "transferFrom(address,address,uint256)",
        params: [
          newMarket.initialSupply.vTokenReceiver,
          ethers.constants.AddressZero,
          newMarket.initialSupply.vTokensToBurn,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
