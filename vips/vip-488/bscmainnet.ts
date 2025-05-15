import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNICHAIN_CORE_COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("10000000", 6);
export const UNICHAIN_vUSDC_CORE_BORROW_CAP = parseUnits("8000000", 6);
export const UNICHAIN_vWETH_CORE = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";
export const UNICHAIN_vWETH_CORE_SUPPLY_CAP = parseUnits("6000", 18);
export const UNICHAIN_vWETH_CORE_BORROW_CAP = parseUnits("4000", 18);

export const vip488 = () => {
  const meta = {
    version: "v2",
    title: "VIP-488 [Unichain] Risk Parameters Adjustments (USDC, WETH)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 04/25/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-25-25/5062):

- [Unichain / USDC (Core pool)](https://app.venus.io/#/core-pool/market/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95?chainId=130):
    - increase supply cap, from 4.3M USDC to 10M USDC
    - increase borrow cap, from 3M USDC to 8M USDC
- [Unichain / WETH (Core pool)](https://app.venus.io/#/core-pool/market/0xc219BC179C7cDb37eACB03f993f9fDc2495e3374?chainId=130):
    - increase supply cap, from 1.5K WETH to 6K WETH
    - increase borrow cap, from 1K WETH to 4K WETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/546](https://github.com/VenusProtocol/vips/pull/546)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vUSDC_CORE, UNICHAIN_vWETH_CORE],
          [UNICHAIN_vUSDC_CORE_SUPPLY_CAP, UNICHAIN_vWETH_CORE_SUPPLY_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vUSDC_CORE, UNICHAIN_vWETH_CORE],
          [UNICHAIN_vUSDC_CORE_BORROW_CAP, UNICHAIN_vWETH_CORE_BORROW_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip488;
