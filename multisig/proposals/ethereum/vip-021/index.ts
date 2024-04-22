import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const CHAINLINK_TUSD_FEED = "0xec746eCF986E2927Abd291a2A1716c940100f8Ba";
const CHAINLINK_STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours

export const TUSD = "0x0000000000085d4780B73119b644AE5ecd22b376";
export const vTUSD = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
export const INITIAL_SUPPLY = parseUnits("1000000", 18);
export const REDUCE_RESERVE_BLOCK = 7200;
export const CF = parseUnits("0.75", 18);
export const LT = parseUnits("0.77", 18);
export const SUPPLY_CAP = parseUnits("2000000", 18);
export const BORROW_CAP = parseUnits("1800000", 18);

const vip021 = () => {
  return makeProposal([
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [TUSD, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: TUSD,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: TUSD,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vTUSD,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVE_BLOCK],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[TUSD, CHAINLINK_TUSD_FEED, CHAINLINK_STALE_PERIOD_26H]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          TUSD,
          [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vTUSD, CF, LT, INITIAL_SUPPLY, ethereum.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip021;
