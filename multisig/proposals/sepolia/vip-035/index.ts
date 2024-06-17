import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const sfrxETH = "0x14AECeEc177085fd09EA07348B4E1F7Fcc030fA1";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const vsfrxETH = "0x7C4890D673985CE22A4D38761473f190e434c956";
export const INITIAL_SUPPLY = parseUnits("1", 18);
export const REWARDS_DISTRIBUTOR_XVS = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const XVS_REWARD_TRANSFER = parseUnits("2400", 18);
export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SUPPLY_CAP = parseUnits("10000", 18);
export const BORROW_CAP = parseUnits("1000", 18);

export const MockSfrxEthFraxOracle = "0x96f7FD1d922Bb6769773BeC88BE6aA615DE77ad1";
export const IS_BAD_DATA = false;
export const PRICE_LOW = "250318482717998";
export const PRICE_HIGH = "250665814578833";
export const SFrxETHOracle = "0x6E202555f0CA6558118C67150e16fbf89080eB3b";
export const PRICE_DIFF = parseUnits("1.14", 18);

export const vip035 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [sfrxETH, [SFrxETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },
    {
      target: SFrxETHOracle,
      signature: "initialize(address,uint256)",
      params: [ACM, PRICE_DIFF],
    },
    {
      target: MockSfrxEthFraxOracle,
      signature: "setPrices(bool,uint256,uint256)",
      params: [IS_BAD_DATA, PRICE_LOW, PRICE_HIGH],
    },

    // Add Market
    {
      target: sfrxETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: sfrxETH,
      signature: "transfer(address,uint256)",
      params: [VTREASURY, INITIAL_SUPPLY],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [sfrxETH, INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
      value: "0",
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
      value: "0",
    },
    {
      target: vsfrxETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [vsfrxETH, "900000000000000000", "930000000000000000", INITIAL_SUPPLY, VTREASURY, SUPPLY_CAP, BORROW_CAP],
      ],
    },

    // Add FRAX and sFrax Market Rewards
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[vsfrxETH], ["3703703703703703"], ["0"]],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_TRANSFER, REWARDS_DISTRIBUTOR_XVS],
    },
  ]);
};

export default vip035;
