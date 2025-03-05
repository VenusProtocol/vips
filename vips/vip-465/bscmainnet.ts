import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BNB_vSolv_BTC_CORE = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const BNB_vSolv_BTC_CORE_SUPPLY_CAP = parseUnits("1720", 18);

export const UNICHAIN_CORE_COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNICHAIN_vWETH_CORE = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";
export const UNICHAIN_vWETH_CORE_SUPPLY_CAP = parseUnits("1000", 18);
export const UNICHAIN_vUSDC_CORE = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const UNICHAIN_vUSDC_CORE_SUPPLY_CAP = parseUnits("1500000", 6);

export const ARBITRUM_CORE_COMPTROLLER = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const ARBITRUM_vgmWETH_CORE = "0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC";
export const ARBITRUM_vgmWETH_CF = parseUnits("0.70", 18);
export const ARBITRUM_vgmWETH_LT = parseUnits("0.75", 18);
export const ARBITRUM_vgmBTC_CORE = "0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF";
export const ARBITRUM_vgmBTC_CF = parseUnits("0.70", 18);
export const ARBITRUM_vgmBTC_LT = parseUnits("0.75", 18);

export const vip465 = () => {
  const meta = {
    version: "v2",
    title: "VIP-465 chaos lab recommendation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[BNB_vSolv_BTC_CORE], [BNB_vSolv_BTC_CORE_SUPPLY_CAP]],
      },
      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[UNICHAIN_vWETH_CORE], [UNICHAIN_vWETH_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: UNICHAIN_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[UNICHAIN_vUSDC_CORE], [UNICHAIN_vUSDC_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: ARBITRUM_CORE_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ARBITRUM_vgmWETH_CORE, ARBITRUM_vgmWETH_CF, ARBITRUM_vgmWETH_LT],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ARBITRUM_CORE_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ARBITRUM_vgmBTC_CORE, ARBITRUM_vgmBTC_CF, ARBITRUM_vgmBTC_LT],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip465;
