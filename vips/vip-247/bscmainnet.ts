import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

export const IL_DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const vTWT = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";

export const UNI_SUPPLY = parseUnits("300000", 18);
export const WBETH_BORROW = parseUnits("2000", 18);
export const TWT_SUPPLY = parseUnits("1500000", 18);

export const OLD_UNI_SUPPLY = parseUnits("200000", 18);
export const OLD_WBETH_BORROW = parseUnits("1000", 18);
export const OLD_TWT_SUPPLY = parseUnits("1000000", 18);

export const TUSD_CF = "0";
export const OLD_TUSD_CF = parseUnits("0.65", 18);

export const vip247 = () => {
  const meta = {
    version: "v2",
    title: "VIP-247 Risk Parameters Adjustments (UNI, WBETH, TWT, TUSD)",
    description: `#### Description

This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 01/29/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-01-29-24/4078).

- [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)
    - Increase supply cap, from 200K UNI to 300K UNI
- [WBETH (Core pool)](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
    - Increase borrow cap, from 1K WBETH to 2K WBETH
- [TWT (DeFi pool)](https://bscscan.com/address/0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F)
    - Increase supply cap, from 1M TWT to 1.5M TWT
- [TUSD (Code pool)](https://bscscan.com/address/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E)
    - Reduce CF, from 0.65 to 0

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/192](https://github.com/VenusProtocol/vips/pull/192)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vUNI], [UNI_SUPPLY]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vWBETH], [WBETH_BORROW]],
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
    ProposalType.FAST_TRACK,
  );
};

export default vip247;
