import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const TUSD = "0x78b292069da1661b7C12B6E766cB506C220b987a";
export const vTUSD = "0xE23A1fC1545F1b072308c846a38447b23d322Ee2";
export const INITIAL_SUPPLY = parseUnits("5000", 18);
export const REDUCE_RESERVE_BLOCK = 7200;
export const CF = parseUnits("0.75", 18);
export const LT = parseUnits("0.77", 18);
export const SUPPLY_CAP = parseUnits("2000000", 18);
export const BORROW_CAP = parseUnits("1800000", 18);

const vip024 = () => {
  return makeProposal([
    {
      target: TUSD,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: TUSD,
      signature: "transfer(address,uint256)",
      params: [sepolia.VTREASURY, INITIAL_SUPPLY],
    },

    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [TUSD, INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
    },
    {
      target: TUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: TUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vTUSD,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVE_BLOCK],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [TUSD, parseUnits("1", 18)],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          TUSD,
          [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vTUSD, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip024;
