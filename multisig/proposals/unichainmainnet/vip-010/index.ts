import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;
const REDSTONE_UNI_FEED = "0xf1454949C6dEdfb500ae63Aa6c784Aa1Dde08A6c";
const STALE_PERIOD_26H = 26 * 60 * 60; // heartbeat of 24H

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";

export const UNI = "0x8f187aA05619a017077f5308904739877ce9eA21";

export const VUNI_CORE = "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2";

export const UNI_INITIAL_SUPPLY = parseUnits("529.463427983309919376", 18);

export const VTOKENS_TO_BE_BURN = parseUnits("1", 8); // around 10$

const EXCHANGE_RATE = parseUnits("1", 28);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vip010 = () => {
  return makeProposal([
    // oracle config
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[UNI, REDSTONE_UNI_FEED, STALE_PERIOD_26H]],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          UNI,
          [unichainmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },

    // Market configurations
    {
      target: VUNI_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: unichainmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [UNI, UNI_INITIAL_SUPPLY, unichainmainnet.GUARDIAN],
    },
    {
      target: UNI,
      signature: "approve(address,uint256)",
      params: [unichainmainnet.POOL_REGISTRY, 0],
    },
    {
      target: UNI,
      signature: "approve(address,uint256)",
      params: [unichainmainnet.POOL_REGISTRY, UNI_INITIAL_SUPPLY],
    },

    {
      target: unichainmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUNI_CORE,
          0, // CF
          0, // LT
          UNI_INITIAL_SUPPLY, // initial supply
          unichainmainnet.GUARDIAN,
          parseUnits("20000", 18), // supply cap
          parseUnits("0", 18), // borrow cap
        ],
      ],
    },
    {
      target: VUNI_CORE,
      signature: "transfer(address,uint256)",
      params: [ethers.constants.AddressZero, VTOKENS_TO_BE_BURN],
    },
    (() => {
      const vTokensMinted = convertAmountToVTokens(UNI_INITIAL_SUPPLY, EXCHANGE_RATE);
      const vTokensRemaining = vTokensMinted.sub(VTOKENS_TO_BE_BURN);
      return {
        target: VUNI_CORE,
        signature: "transfer(address,uint256)",
        params: [unichainmainnet.VTREASURY, vTokensRemaining],
      };
    })(),
    {
      target: VUNI_CORE,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.05", 18)],
    },

    {
      target: COMPTROLLER_CORE,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[VUNI_CORE], [2], true],
    },
  ]);
};
export default vip010;
