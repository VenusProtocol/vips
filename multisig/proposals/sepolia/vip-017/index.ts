import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";
import { parseUnits } from "ethers/lib/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const WeETH_ORACLE = "0xdDeF173bbf37F689bf84d877e2Af4625eC9c22c6";
export const weETH = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const eETH = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
export const CHAINLINK_ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
export const LIQUIDITY_POOL = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const CHAINLINK_STALE_PERIOD = "86400";
export const AMOUNT_FOR_SHARE = parseUnits("1.035397719468640492", 18)

export const vip017 = () => {
  return makeProposal([
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [
        [
          eETH,
          CHAINLINK_ETH_FEED,
          CHAINLINK_STALE_PERIOD
        ],
      ],
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
        [
          weETH,
          [WeETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
    {
      target: LIQUIDITY_POOL,
      signature: "setAmountPerShare(uint256)",
      params: [AMOUNT_FOR_SHARE]
    }
  ]);
};

export default vip017;
