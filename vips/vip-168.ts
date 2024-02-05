import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VXRP = "0xb248a295732e0225acd3337607cc01068e3b9c10";
export const VFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const VADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";
export const VLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";

export const vip168 = () => {
  const meta = {
    version: "v2",
    title: "VIP-168 Risk Parameters Adjustments",
    description: `**Summary**

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 09/05/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-05-2023/3749)

* Increase Collateral Factor of **XRP** by 5% from 60% to 65%
* Increase Collateral Factor of **FIL** by 2% from 61% to 63%
* Increase Collateral Factor of **LTC** by 1% from 62% to 63%
* Increase Collateral Factor of **ADA** by 3% from 60% to 63%
* Increase supply cap of **TUSD** to 3,000,000 TUSD
* Increase borrow cap of **WBETH** to 2,200 WBETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/68](https://github.com/VenusProtocol/vips/pull/68)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VXRP, parseUnits("0.65", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VFIL, parseUnits("0.63", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VADA, parseUnits("0.63", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VLTC, parseUnits("0.63", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VTUSD], [parseUnits("3000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("2200", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
