import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const WEETH_REDSTONE_FEED = "0xBf3bA2b090188B40eF83145Be0e9F30C6ca63689";
export const WSTETH_REDSTONE_FEED = "0xC3346631E0A9720582fB9CAbdBEA22BC2F57741b";
export const WEETH_ORACLE = "0xF9ECA470E2458Fe2B6FcAe660bEd1e2C0FB87E01";
export const WSTETH_ORACLE = "0x3938D6414c261C6F450f1bD059DF9af2BBfb603D";
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

const STALE_PERIOD_26H = 26 * 60 * 60; // heartbeat of 24H
export const CONVERSION_INCENTIVE = parseUnits("1", 14);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const weETH: Token = {
  address: "0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7",
  decimals: 18,
  symbol: "weETH",
};

export const wstETH: Token = {
  address: "0xc02fE7317D4eb8753a02c35fe019786854A92001",
  decimals: 18,
  symbol: "wstETH",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokensToBurn: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const weETHMarket: Market = {
  vToken: {
    address: "0x0170398083eb0D0387709523baFCA6426146C218",
    name: "Venus weETH (Core)",
    symbol: "vweETH_Core",
    underlying: weETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("4000", 18),
    borrowCap: parseUnits("400", 18),
    reserveFactor: parseUnits("0.4", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3.614915477041407445", 18),
    vTokensToBurn: parseUnits("0.03694", 8), // around $100
    vTokenReceiver: unichainmainnet.VTREASURY,
  },
  interestRateModel: {
    address: "0xc2edB1e96e45178b901618B96142C2743Ed0e7B3",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const wstETHMarket: Market = {
  vToken: {
    address: "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: wstETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.725", 18),
    supplyCap: parseUnits("14000", 18),
    borrowCap: parseUnits("7000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3.208916246034338443", 18),
    vTokensToBurn: parseUnits("0.03309", 8), // around $100
    vTokenReceiver: unichainmainnet.VTREASURY,
  },
  interestRateModel: {
    address: "0x5C7D8858a25778d992eE803Ce79F1eff60c1d9D1",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
};

const vip501 = () => {
  const meta = {
    version: "v2",
    title: "VIP-501 [Unichain] Add weETH and wstETH markets to the Core pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // <--- weETH Market --->
      // Oracle config
      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[weETH.address, WEETH_REDSTONE_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH.address,
            [WEETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // Market configurations
      {
        target: weETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          weETHMarket.vToken.underlying.address,
          weETHMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, weETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            weETHMarket.vToken.address,
            weETHMarket.riskParameters.collateralFactor, // CF
            weETHMarket.riskParameters.liquidationThreshold, // LT
            weETHMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            weETHMarket.riskParameters.supplyCap, // supply cap
            weETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, weETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(weETHMarket.initialSupply.amount, weETHMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(weETHMarket.initialSupply.vTokensToBurn);
        return {
          target: weETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [weETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),

      // <--- wstETH Market --->
      // oracle config
      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[wstETH.address, WSTETH_REDSTONE_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH.address,
            [WSTETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // Market configurations
      {
        target: wstETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          wstETHMarket.vToken.underlying.address,
          wstETHMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, wstETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            wstETHMarket.vToken.address,
            wstETHMarket.riskParameters.collateralFactor, // CF
            wstETHMarket.riskParameters.liquidationThreshold, // LT
            wstETHMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            wstETHMarket.riskParameters.supplyCap, // supply cap
            wstETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, wstETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          wstETHMarket.initialSupply.amount,
          wstETHMarket.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(wstETHMarket.initialSupply.vTokensToBurn);
        return {
          target: wstETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [wstETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("20000", 18), VANGUARD_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
