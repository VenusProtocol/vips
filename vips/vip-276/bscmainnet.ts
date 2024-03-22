import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const IL_DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const IL_GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";

export const vUNI_CORE = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vWBETH_CORE = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const vETH_CORE = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vUSDC_CORE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vTWT_DEFI = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";
export const vUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";

export const vUNI_SUPPLY_CAP = parseUnits("400000", 18);
export const vWBETH_BORROW_CAP = parseUnits("8000", 18);
export const vETH_BORROW_CAP = parseUnits("60000", 18);
export const vUSDC_BORROW_CAP = parseUnits("200000000", 18);
export const vTWT_SUPPLY_CAP = parseUnits("3000000", 18);
export const vUSDT_BORROW_CAP = parseUnits("1100000", 18);

export const vip276 = () => {
  const meta = {
    version: "v2",
    title: "VIP-276 Risk Parameters Adjustments",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vUNI_CORE], [vUNI_SUPPLY_CAP]],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vWBETH_CORE, vETH_CORE, vUSDC_CORE],
          [vWBETH_BORROW_CAP, vETH_BORROW_CAP, vUSDC_BORROW_CAP],
        ],
      },
      {
        target: IL_DEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vTWT_DEFI], [vTWT_SUPPLY_CAP]],
      },
      {
        target: IL_GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [vUSDT_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip276;
