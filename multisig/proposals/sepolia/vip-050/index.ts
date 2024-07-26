import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const ezETH_ONE_JUMP_REDSTONE_ORACLE = "0x32Aba08E2150BB3D07d77c4945dc7238382FB8eD";
const ezETH_ONE_JUMP_CHAINLINK_ORACLE = "0xdA0817d5626fC3dBc74B678e1DD0397591A39F5b";
export const ezETH = "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c";
export const vezETH = "0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A";
const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
const INITIAL_SUPPLY = parseUnits("2", 18);
export const SUPPLY_CAP = parseUnits("14000", 18);
export const BORROW_CAP = parseUnits("1400", 18);
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);

export const vip050 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[ezETH, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [ezETH, parseUnits("1", 18)],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [ezETH, parseUnits("1", 18)],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          ezETH,
          [ezETH_ONE_JUMP_REDSTONE_ORACLE, ezETH_ONE_JUMP_CHAINLINK_ORACLE, ezETH_ONE_JUMP_CHAINLINK_ORACLE],
          [true, true, true],
        ],
      ],
    },

    // Add Market
    {
      target: ezETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: ezETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: ezETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vezETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vezETH, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
    {
      target: vezETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
  ]);
};

export default vip050;
