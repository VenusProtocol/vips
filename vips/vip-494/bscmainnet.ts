import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER_LST = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNI = "0x8f187aA05619a017077f5308904739877ce9eA21";

export const UNICHAIN_vUNI_CORE = "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2";
export const UNICHAIN_vUNI_CORE_SUPPLY_CAP = parseUnits("4000000", 18);
export const UNICHAIN_vUNI_CORE_BORROW_CAP = parseUnits("2000000", 18);

export const BNB_vasBNB_LST = "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288";
export const BNB_vasBNB_LST_SUPPLY_CAP = parseUnits("10000", 18);

export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("15000000", 6);
export const UNICHAIN_vUSDC_CORE_BORROW_CAP = parseUnits("12000000", 6);

export const RESERVE_FACTOR = parseUnits("0.25", 18);
export const COLLATERAL_FACTOR = parseUnits("0.50", 18);
export const LIQUIDATION_THRESHOLD = parseUnits("0.55", 18);
export const newInterestRateModel = "0x5C7D8858a25778d992eE803Ce79F1eff60c1d9D1";

const vip494 = () => {
  const meta = {
    version: "v2",
    title: "VIP-494 [Unichain][BNB Chain] Risk Parameters Adjustments (UNI, USDC, asBNB)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - UNI Parameter Updates - 05/06/25](https://community.venus.io/t/chaos-labs-uni-parameter-updates-05-06-25/5086):

- [Unichain / UNI (Core pool)](https://app.venus.io/#/core-pool/market/0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2?chainId=130):
    - Increase supply cap, from 20K UNI to 4M UNI
    - Increase borrow cap, from 0 UNI to 2M UNI
    - Enable borrows
    - Set Collateral Factor to 50% and Liquidation Threshold to 55%
    - Update the interest rate curve:
      - kink: 80%
      - base (yearly): 0%
      - multiplier (yearly): 15%
      - jump multiplier (yearly): 300%

Moreover, it will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 05/08/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-05-08-25/5091)

- [BNB Chain / asBNB (Liquid Staked BNB pool)](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288?chainId=56):
    - Increase supply cap from 2,000 asBNB to 10,000 asBNB

Finally, following the community post [[UNICHAIN] Increase Caps FOR USDC](https://community.venus.io/t/unichain-increase-caps-for-usdc/5093), this VIP will perform the following changes on the [USDC market on Unichain](https://app.venus.io/#/core-pool/market/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95?chainId=130):

- Increase supply cap, from 10M USDC to 15M USDC
- Increase borrow cap, from 8M USDC to 12M USDC

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/556](https://github.com/VenusProtocol/vips/pull/556)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Market configurations
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vUNI_CORE, UNICHAIN_vUSDC_CORE],
          [UNICHAIN_vUNI_CORE_SUPPLY_CAP, UNICHAIN_vUSDC_CORE_SUPPLY_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [UNICHAIN_vUNI_CORE, UNICHAIN_vUSDC_CORE],
          [UNICHAIN_vUNI_CORE_BORROW_CAP, UNICHAIN_vUSDC_CORE_BORROW_CAP],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [UNICHAIN_vUNI_CORE, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: UNICHAIN_vUNI_CORE,
        signature: "setInterestRateModel(address)",
        params: [newInterestRateModel],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[UNICHAIN_vUNI_CORE], [2], false],
        dstChainId: LzChainId.unichainmainnet,
      },

      // asBNB update
      {
        target: COMPTROLLER_LST,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[BNB_vasBNB_LST], [BNB_vasBNB_LST_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip494;
