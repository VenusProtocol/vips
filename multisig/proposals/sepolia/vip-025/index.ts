import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const sFRAXOracle = "0x163cA9Eb6340643154F8691C5DAd3aC844266717";
export const sFRAX = "0xd85FfECdB4287587BC53c1934D548bF7480F11C4";
export const FRAX = "0x10630d59848547c9F59538E2d8963D63B912C075";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

// export const vweETH = "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b";
// export const REWARDS_DISTRIBUTOR = "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A";
// export const COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
// export const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";

export const FRAX_PRICE = parseUnits("1", 18);
export const SFRAX_TO_FRAX_RATE = parseUnits("1.041208475916013035", 18);

// export const CHAINLINK_STALE_PERIOD = "86400";
// export const AMOUNT_FOR_SHARE = parseUnits("1.035397719468640492", 18);
// export const REWARD_SPEED = "23148";
// export const USDC_REWARD_TRANSFER = parseUnits("5000", 6);

export const vip025 = () => {
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

    // Add Market
    // {
    //   target: weETH,
    //   signature: "faucet(uint256)",
    //   params: ["5000000000000000000"],
    // },
    // {
    //   target: weETH,
    //   signature: "transfer(address,uint256)",
    //   params: [VTREASURY, "5000000000000000000"],
    // },
    // {
    //   target: VTREASURY,
    //   signature: "withdrawTreasuryToken(address,uint256,address)",
    //   params: [weETH, "5000000000000000000", sepolia.NORMAL_TIMELOCK],
    //   value: "0",
    // },
    // {
    //   target: weETH,
    //   signature: "approve(address,uint256)",
    //   params: [sepolia.POOL_REGISTRY, 0],
    //   value: "0",
    // },
    // {
    //   target: weETH,
    //   signature: "approve(address,uint256)",
    //   params: [sepolia.POOL_REGISTRY, "5000000000000000000"],
    //   value: "0",
    // },
    // {
    //   target: vweETH,
    //   signature: "setReduceReservesBlockDelta(uint256)",
    //   params: ["7200"],
    //   value: "0",
    // },
    // {
    //   target: sepolia.POOL_REGISTRY,
    //   signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    //   params: [
    //     [
    //       vweETH,
    //       "900000000000000000",
    //       "930000000000000000",
    //       "5000000000000000000",
    //       VTREASURY,
    //       "7500000000000000000000",
    //       "750000000000000000000",
    //     ],
    //   ],
    //   value: "0",
    // },

    // // Add Rewards
    // {
    //   target: REWARDS_DISTRIBUTOR,
    //   signature: "acceptOwnership()",
    //   params: [],
    // },
    // {
    //   target: COMPTROLLER,
    //   signature: "addRewardsDistributor(address)",
    //   params: [REWARDS_DISTRIBUTOR],
    // },
    // {
    //   target: REWARDS_DISTRIBUTOR,
    //   signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    //   params: [[vweETH], [REWARD_SPEED], ["0"]],
    //   value: "0",
    // },
    // {
    //   target: USDC,
    //   signature: "faucet(uint256)",
    //   params: [USDC_REWARD_TRANSFER],
    // },
    // {
    //   target: USDC,
    //   signature: "transfer(address,uint256)",
    //   params: [REWARDS_DISTRIBUTOR, USDC_REWARD_TRANSFER],
    // },
  ]);
};

export default vip025;
