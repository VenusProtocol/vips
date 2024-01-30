import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

export const IL_DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const vTWT = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";

export const UNI_SUPPLY = parseUnits("300000", 18);
export const WBETH_SUPPLY = parseUnits("2000", 18);
export const TWT_SUPPLY = parseUnits("1500000", 18);

export const OLD_UNI_SUPPLY = parseUnits("200000", 18);
export const OLD_WBETH_SUPPLY = parseUnits("40000", 18);
export const OLD_TWT_SUPPLY = parseUnits("1000000", 18);

export const TUSD_CF = "0";
export const OLD_TUSD_CF = parseUnits("0.65", 18);

export const vip247 = () => {
  const meta = {
    version: "v2",
    title: "VIP-247 Chaos Labs Recommendations",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI, vWBETH],
          [UNI_SUPPLY, WBETH_SUPPLY],
        ],
      },
      {
        target: IL_DEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vTWT], [TWT_SUPPLY]],
      },
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [vTUSD, TUSD_CF],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip247;
