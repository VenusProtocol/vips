import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
export const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
export const ONE_JUMP_MAIN = "0xB15CA4Cd4bA5696FDC1cbBd859588c0421cc1F68";
export const ONE_JUMP_PIVOT = "0xDAF249b4A937385dB567B73630539BacDBB04342";
export const rsETH = "0xfA0614E5C803E15070d31f7C38d2d430EBe68E47";
export const vrsETH = "0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf";
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const INITIAL_SUPPLY = parseUnits("100", 18); // TBC
export const SUPPLY_CAP = parseUnits("8000", 18);
export const BORROW_CAP = parseUnits("3600", 18);
export const CF = parseUnits("0.8", 18);
export const LT = parseUnits("0.85", 18);

export const vip035 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[rsETH, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [rsETH, parseUnits("1", 18)],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [rsETH, parseUnits("1", 18)],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [[rsETH, [ONE_JUMP_MAIN, ONE_JUMP_PIVOT, ethers.constants.AddressZero], [true, true, false]]],
    },

    // Add Market
    {
      target: rsETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: rsETH,
      signature: "transfer(address,uint256)",
      params: [sepolia.VTREASURY, INITIAL_SUPPLY],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [rsETH, INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
    },
    {
      target: rsETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: rsETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vrsETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vrsETH,
          CF,
          LT,
          INITIAL_SUPPLY,
          sepolia.VTREASURY, // TBD
          SUPPLY_CAP,
          BORROW_CAP,
        ],
      ],
    },
  ]);
};

export default vip035;
