import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const WeETH_ORACLE = "0xdDeF173bbf37F689bf84d877e2Af4625eC9c22c6";
export const weETH = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const eETH = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
export const CHAINLINK_ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
export const LIQUIDITY_POOL = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const vweETH = "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b";

export const CHAINLINK_STALE_PERIOD = "86400";
export const AMOUNT_FOR_SHARE = parseUnits("1.035397719468640492", 18);

export const vip017 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[eETH, CHAINLINK_ETH_FEED, CHAINLINK_STALE_PERIOD]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          eETH,
          [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [weETH, [WeETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },
    {
      target: LIQUIDITY_POOL,
      signature: "setAmountPerShare(uint256)",
      params: [AMOUNT_FOR_SHARE],
    },

    // Add Market
    {
      target: weETH,
      signature: "faucet(uint256)",
      params: ["5000000000000000000"],
    },
    {
      target: weETH,
      signature: "transfer(address,uint256)",
      params: [VTREASURY, "5000000000000000000"],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [weETH, "5000000000000000000", sepolia.NORMAL_TIMELOCK],
      value: "0",
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "5000000000000000000"],
      value: "0",
    },
    {
      target: vweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
      value: "0",
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vweETH,
          "900000000000000000",
          "930000000000000000",
          "5000000000000000000",
          VTREASURY,
          "7500000000000000000000",
          "750000000000000000000",
        ],
      ],
      value: "0",
    },

    // Add Rewards
    {
      target: "0x4597B9287fE0DF3c5513D66886706E0719bD270f",
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[vweETH], ["23148148148148148"], ["0"]],
      value: "0",
    },
  ]);
};

export default vip017;
