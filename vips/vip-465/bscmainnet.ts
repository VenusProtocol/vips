import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNICHAIN_CORE_COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("4300000", 6);
export const UNICHAIN_vUSDC_CORE_BORROW_CAP = parseUnits("3000000", 6);

export const vip465 = () => {
  const meta = {
    version: "v2",
    title: "VIP-465 [Unichain] Risk Parameters Adjustments (USDC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 03/10/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-03-10-25/4986):

- [Unichain / USDC (Core pool)](https://app.venus.io/#/core-pool/market/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95?chainId=130):
    - increase supply cap, from 3M USDC to 4.3M USDC
    - increase borrow cap, from 1.5M UNI to 3M USDC

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/521](https://github.com/VenusProtocol/vips/pull/521)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[UNICHAIN_vUSDC_CORE], [UNICHAIN_vUSDC_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[UNICHAIN_vUSDC_CORE], [UNICHAIN_vUSDC_CORE_BORROW_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip465;
