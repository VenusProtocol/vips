import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const CHAINLINK_DAI_FEED = "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19";
const CHAINLINK_STALE_PERIOD = 26 * 60 * 60;

export const DAI = "0x75236711d42D0f7Ba91E03fdCe0C9377F5b76c07";
export const vDAI = "0xfe050f628bF5278aCfA1e7B13b59fF207e769235";
export const INITIAL_SUPPLY = parseUnits("5000", 18);
export const REDUCE_RESERVE_BLOCK = 7200;
export const CF = parseUnits("0.75", 18);
export const LT = parseUnits("0.77", 18);
export const SUPPLY_CAP = parseUnits("50000000", 18);
export const BORROW_CAP = parseUnits("45000000", 18);

const vip019 = () => {
  return makeProposal([
    {
      target: DAI,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: DAI,
      signature: "transfer(address,uint256)",
      params: [sepolia.VTREASURY, INITIAL_SUPPLY],
    },

    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [DAI, INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
    },
    {
      target: DAI,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: DAI,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vDAI,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVE_BLOCK],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[DAI, CHAINLINK_DAI_FEED, CHAINLINK_STALE_PERIOD]],
    },

    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          DAI,
          [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vDAI, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip019;
