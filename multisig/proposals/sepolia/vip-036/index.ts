import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const rsETH_ONE_JUMP_REDSTONE_ORACLE = "0xB15CA4Cd4bA5696FDC1cbBd859588c0421cc1F68";
const rsETH_ONE_JUMP_CHAINLINK_ORACLE = "0xDAF249b4A937385dB567B73630539BacDBB04342";
export const rsETH = "0xfA0614E5C803E15070d31f7C38d2d430EBe68E47";
export const vrsETH = "0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf";
const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
const INITIAL_SUPPLY = parseUnits("2", 18);
export const SUPPLY_CAP = parseUnits("8000", 18);
export const BORROW_CAP = parseUnits("3600", 18);
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);

export const vip036 = () => {
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
      params: [
        [
          rsETH,
          [rsETH_ONE_JUMP_REDSTONE_ORACLE, rsETH_ONE_JUMP_CHAINLINK_ORACLE, rsETH_ONE_JUMP_CHAINLINK_ORACLE],
          [true, true, true],
        ],
      ],
    },

    // Add Market
    {
      target: rsETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
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
      params: [[vrsETH, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip036;
