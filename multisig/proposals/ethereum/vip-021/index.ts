import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const CHAINLINK_DAI_FEED = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9";
const CHAINLINK_STALE_PERIOD = 100 * 60;

export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const vDAI = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const INITIAL_SUPPLY = parseUnits("5000", 18);
export const REDUCE_RESERVE_BLOCK = 7200;
export const CF = parseUnits("0.75", 18);
export const LT = parseUnits("0.77", 18);
export const SUPPLY_CAP = parseUnits("50000000", 18);
export const BORROW_CAP = parseUnits("45000000", 18);

const vip021 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[DAI, CHAINLINK_DAI_FEED, CHAINLINK_STALE_PERIOD]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          DAI,
          [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [DAI, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: DAI,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: DAI,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vDAI,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVE_BLOCK],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vDAI, CF, LT, INITIAL_SUPPLY, ethereum.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip021;
