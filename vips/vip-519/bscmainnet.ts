import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;

export const CERTIK = "0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const sUSDe_REFUND_ADDRESS = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";
export const MESSARI = "0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a";
export const NODEREAL = "0x435012d5ffebe02d3d8ceff769b379cf2b1c32ee";

export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const sUSDe_ETH = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const CERTIK_USDT_AMOUNT_1 = parseUnits("17500", 18);
export const CERTIK_USDT_AMOUNT_2 = parseUnits("35000", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const sUSDe_REFUND_AMOUNT = parseUnits("10000", 18);
export const MESSARI_USDC_AMOUNT = parseUnits("23750", 6);
export const NODEREAL_USDT_AMOUNT = parseUnits("14580", 18);

export const vip519 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-519",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, CERTIK_USDT_AMOUNT_1, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, CERTIK_USDT_AMOUNT_2, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC_BSC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, NODEREAL_USDT_AMOUNT, NODEREAL],
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDe_ETH, sUSDe_REFUND_AMOUNT, sUSDe_REFUND_ADDRESS],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC_ETH, MESSARI_USDC_AMOUNT, MESSARI],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip519;
