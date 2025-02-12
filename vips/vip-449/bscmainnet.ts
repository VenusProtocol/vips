import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETHEREUM_vBAL_CORE = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
export const ETHEREUM_vBAL_CORE_SUPPLY_CAP = parseUnits("2000000", 18);

export const ZKSYNC_CORE_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const ZKSYNC_vUSDC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const ZKSYNC_vUSDC_CORE_SUPPLY_CAP = parseUnits("35000000", 6);

export const vip449 = () => {
  const meta = {
    version: "v2",
    title: "VIP-449",
    description: ``,
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
        target: ZKSYNC_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[ZKSYNC_vUSDC_CORE], [ZKSYNC_vUSDC_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip449;
