import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const USDT = "0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA";
export const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";

const vip513 = () => {
  const meta = {
    version: "v2",
    title: "Fix USDC and USDT price feed on Unichain Sepolia",
    description:
      "The price feeds used by the RedStoneOracle on unichain sepolia for USDC (0x197225B3B017eb9b72Ac356D6B3c267d0c04c57c) and USDT (0x3fd49f2146FE0e10c4AE7E3fE04b3d5126385Ac4) are not updated. Let's use a fixed price",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDT, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDC, parseUnits("1", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip513;
