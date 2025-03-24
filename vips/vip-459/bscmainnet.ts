import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETHEREUM_vBAL_CORE = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
export const ETHEREUM_vBAL_CORE_SUPPLY_CAP = parseUnits("4100000", 18);

export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const ETHEREUM_BAL_LIQUIDITY = parseUnits("6.459676139191680191", 18);
export const ETHEREUM_BAL = "0xba100000625a3754423978a60c9317c58a424e3d";

export const VBAL_RECEIVER = "0x000000000000000000000000000000000000dEaD";

export const vip459 = () => {
  const meta = {
    version: "v2",
    title: "VIP-459 [Ethereum] Risk Parameters Adjustments (BAL)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 2/28/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-02-28-25).

- Ethereum / [BAL (Core pool)](https://etherscan.io/address/0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8):
    - Increase supply cap, from 4M BAL to 4.1M BAL

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/516](https://github.com/VenusProtocol/vips/pull/516)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ETHEREUM_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[ETHEREUM_vBAL_CORE], [ETHEREUM_vBAL_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_BAL,
        signature: "approve(address,uint256)",
        params: [ETHEREUM_vBAL_CORE, ETHEREUM_BAL_LIQUIDITY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_vBAL_CORE,
        signature: "mintBehalf(address,uint256)",
        params: [VBAL_RECEIVER, ETHEREUM_BAL_LIQUIDITY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_BAL,
        signature: "approve(address,uint256)",
        params: [ETHEREUM_vBAL_CORE, 0],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip459;
