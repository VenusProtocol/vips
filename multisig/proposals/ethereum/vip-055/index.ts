import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

export const ACCOUNTANT_ORACLE = "0x132f91AA7afc590D591f168A780bB21B4c29f577";
export const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";
const INITIAL_SUPPLY = parseUnits("10.009201470952191487", 18);
export const SUPPLY_CAP = parseUnits("180", 18);
export const BORROW_CAP = parseUnits("0", 18);
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);
export const vweETHs = "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9";
export const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const VTOKEN_RECEIVER = "0x86fBaEB3D6b5247F420590D303a6ffC9cd523790";
const { ethereum } = NETWORK_ADDRESSES;

export const vip055 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [weETHs, [ACCOUNTANT_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },

    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [weETHs, INITIAL_SUPPLY, ethereum.GUARDIAN],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vweETHs,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vweETHs, CF, LT, INITIAL_SUPPLY, VTOKEN_RECEIVER, SUPPLY_CAP, BORROW_CAP]],
    },
    {
      target: vweETHs,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: LIQUID_STAKED_COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[vweETHs], [2], true],
    },
  ]);
};

export default vip055;
