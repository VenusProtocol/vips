import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const AMOUNT = parseUnits("10000", 18); // TBD
export const WETH_DISTRIBUTION_SPEED = parseUnits("2752.7006172839", 10); // TBD
export const USDC_DISTRIBUTION_SPEED = parseUnits("11574074.074074074", 10); // TBD

export const PRIME_LIQUIDITY_PROVIDER = "0xDA4dcFBdC06A9947100a757Ee0eeDe88debaD586";
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const vip502 = () => {
  const meta = {
    version: "v2",
    title: "Bootstrap liquidity for unichain prime",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: unichainsepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC, AMOUNT, unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [WETH, AMOUNT, unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: USDC,
        signature: "transfer(address,uint256)",
        params: [PRIME_LIQUIDITY_PROVIDER, AMOUNT],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WETH,
        signature: "transfer(address,uint256)",
        params: [PRIME_LIQUIDITY_PROVIDER, AMOUNT],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [WETH, USDC],
          [WETH_DISTRIBUTION_SPEED, USDC_DISTRIBUTION_SPEED],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip502;
