import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const sFRAXOracle = "0x163cA9Eb6340643154F8691C5DAd3aC844266717";
export const sFRAX = "0xd85FfECdB4287587BC53c1934D548bF7480F11C4";
export const FRAX = "0x10630d59848547c9F59538E2d8963D63B912C075";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const vFRAX = "0x33942B932159A67E3274f54bC4082cbA4A704340";
export const vsFRAX = "0x18995825f033F33fa30CF59c117aD21ff6BdB48c";
export const REWARDS_DISTRIBUTOR_XVS = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";
export const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

export const FRAX_PRICE = parseUnits("1", 18);
export const SFRAX_TO_FRAX_RATE = parseUnits("1.041208475916013035", 18);

export const XVS_REWARD_TRANSFER = parseUnits("4800", 18);
export const FRAX_INITIAL_SUPPLY = parseUnits("5000", 18);
export const sFRAX_INITIAL_SUPPLY = parseUnits("4800", 18);

export const vip026 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [FRAX, FRAX_PRICE],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          FRAX,
          [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [sFRAX, [sFRAXOracle, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },
    {
      target: sFRAX,
      signature: "setRate(uint256)",
      params: [SFRAX_TO_FRAX_RATE],
    },

    // Add FRAX Market
    {
      target: FRAX,
      signature: "faucet(uint256)",
      params: [FRAX_INITIAL_SUPPLY],
    },
    {
      target: FRAX,
      signature: "transfer(address,uint256)",
      params: [VTREASURY, FRAX_INITIAL_SUPPLY],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [FRAX, FRAX_INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
    },
    {
      target: FRAX,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: FRAX,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, FRAX_INITIAL_SUPPLY],
    },
    {
      target: vFRAX,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vFRAX,
          "750000000000000000",
          "800000000000000000",
          "5000000000000000000000",
          VTREASURY,
          "10000000000000000000000000",
          "8000000000000000000000000",
        ],
      ],
    },

    // Add sFRAX Market
    {
      target: sFRAX,
      signature: "faucet(uint256)",
      params: [sFRAX_INITIAL_SUPPLY],
    },
    {
      target: sFRAX,
      signature: "transfer(address,uint256)",
      params: [VTREASURY, sFRAX_INITIAL_SUPPLY],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [sFRAX, sFRAX_INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sFRAX,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sFRAX,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, sFRAX_INITIAL_SUPPLY],
    },
    {
      target: vsFRAX,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vsFRAX,
          "750000000000000000",
          "800000000000000000",
          "4800000000000000000000",
          VTREASURY,
          "10000000000000000000000000",
          "1000000000000000000000000",
        ],
      ],
    },

    // Add FRAX and sFrax Market Rewards
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [vFRAX, vsFRAX],
        ["1481481481481481", "2222222222222222"],
        ["2222222222222222", "1481481481481481"],
      ],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_REWARD_TRANSFER, REWARDS_DISTRIBUTOR_XVS],
    },
  ]);
};

export default vip026;
