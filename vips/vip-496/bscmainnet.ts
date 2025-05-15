import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";

export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("30000000", 6);
export const UNICHAIN_vUSDC_CORE_BORROW_CAP = parseUnits("27000000", 6);

const vip496 = () => {
  const meta = {
    version: "v2",
    title: "VIP-496 [Unichain] Risk Parameters Adjustments (USDC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [[UNICHAIN] Increase Caps FOR USDC](https://community.venus.io/t/unichain-increase-caps-for-usdc/5093/2):

- [USDC market on Unichain](https://app.venus.io/#/core-pool/market/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95?chainId=130):
  - Increase supply cap, from 15M USDC to 30M USDC
  - Increase borrow cap, from 12M USDC to 27M USDC

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/558](https://github.com/VenusProtocol/vips/pull/558)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[UNICHAIN_vUSDC_CORE], [UNICHAIN_vUSDC_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[UNICHAIN_vUSDC_CORE], [UNICHAIN_vUSDC_CORE_BORROW_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip496;
