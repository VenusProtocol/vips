import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BNB_UNI_CORE = "0x27FF564707786720C71A2e5c1490A63266683612";
export const BNB_UNI_CORE_SUPPLY_CAP = parseUnits("1560000", 18);
export const BNB_TWT_CORE = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const BNB_TWT_CORE_SUPPLY_CAP = parseUnits("4000000", 18);

export const UNICHAIN_CORE_COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNICHAIN_vWETH_CORE = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";
export const UNICHAIN_vWETH_CORE_SUPPLY_CAP = parseUnits("1500", 18);
export const UNICHAIN_vWETH_CORE_BORROW_CAP = parseUnits("1000", 18);
export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("3000000", 6);
export const UNICHAIN_vUSDC_CORE_BORROW_CAP = parseUnits("1500000", 6);

export const vip463 = () => {
  const meta = {
    version: "v2",
    title: "VIP-463 [Unichain][BNB Chain] Risk Parameters Adjustments (WETH, USDC, UNI, TWT)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 03/06/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-03-06-25/4984):

- [BNB Chain / TWT (Core pool)](https://app.venus.io/#/core-pool/market/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc?chainId=56): increase supply cap from 2M TWT to 4M TWT
- [BNB Chain / UNI (Core pool)](https://app.venus.io/#/core-pool/market/0x27FF564707786720C71A2e5c1490A63266683612?chainId=56): increase supply cap from 1.3M UNI to 1.56M UNI
- [Unichain / WETH (Core pool)](https://app.venus.io/#/core-pool/market/0xc219BC179C7cDb37eACB03f993f9fDc2495e3374?chainId=130):
    - increase supply cap, from 1,000 WETH to 1,500 WETH
    - increase borrow cap, from 300 WETH to 1,000 WETH
- [Unichain / USDC (Core pool)](https://app.venus.io/#/core-pool/market/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95?chainId=130):
    - increase supply cap, from 1.5M USDC to 3M USDC
    - increase borrow cap, from 850K UNI to 1.5M UNI

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/519](https://github.com/VenusProtocol/vips/pull/519)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [BNB_UNI_CORE, BNB_TWT_CORE],
          [BNB_UNI_CORE_SUPPLY_CAP, BNB_TWT_CORE_SUPPLY_CAP],
        ],
      },
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vWETH_CORE, UNICHAIN_vUSDC_CORE],
          [UNICHAIN_vWETH_CORE_SUPPLY_CAP, UNICHAIN_vUSDC_CORE_SUPPLY_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vWETH_CORE, UNICHAIN_vUSDC_CORE],
          [UNICHAIN_vWETH_CORE_BORROW_CAP, UNICHAIN_vUSDC_CORE_BORROW_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip463;
