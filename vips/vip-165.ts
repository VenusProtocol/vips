import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
const VDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
const VLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
const VFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
const VDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";

export const vip165 = () => {
  const meta = {
    version: "v2",
    title: "VIP-165 Risk Parameters Adjustments",
    description: `**Summary**

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 08/28/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-28-2023/3720)

* Increase Collateral Factor of **MATIC** by 5% from 60% to 65%
* Increase Collateral Factor of **DOGE** by 3% from 40% to 43%
* Increase Collateral Factor of **LTC** by 2% from 60% to 62%
* Increase Collateral Factor of **FIL** by 1% from 60% to 61%
* Increase Collateral Factor of **DAI** by 15% from 60% to 75%
* Increase Collateral Factor of **LINK** by 3% from 60% to 63%
* Increase Collateral Factor of **DOT** by 5% from 60% to 65%
* Set Collateral Factor of **TUSD** by 75% from 0 to 75%
* Increase supply cap of **WBETH** to 27,000

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/66](https://github.com/VenusProtocol/vips/pull/66)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VMATIC, parseUnits("0.65", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VDOGE, parseUnits("0.43", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VLTC, parseUnits("0.62", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VFIL, parseUnits("0.61", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VDAI, parseUnits("0.75", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VLINK, parseUnits("0.63", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VDOT, parseUnits("0.65", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VTUSD, parseUnits("0.75", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("27000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
