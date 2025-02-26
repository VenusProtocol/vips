import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETHEREUM_vBAL_CORE = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
export const ETHEREUM_vBAL_CORE_SUPPLY_CAP = parseUnits("4000000", 18);

export const vip458 = () => {
  const meta = {
    version: "v2",
    title: "VIP-458 [Ethereum] Risk Parameters Adjustments (BAL)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 2/25/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-2-25-25/4956).

- Ethereum / [BAL (Core pool)](https://etherscan.io/address/0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8):
    - Increase supply cap, from 3M BAL to 4M BAL

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/514](https://github.com/VenusProtocol/vips/pull/514)`,
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
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip458;
