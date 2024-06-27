import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
const VSXP_RESERVES = "526189372708075633111";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const BINANCE_SWAPPER_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";
const SXP_FOR_SWAPPING = "26137012855296712152656"; // 25610823482588636519545 + 526189372708075633111. current balance + reduced reserves

export const vip117 = () => {
  const meta = {
    version: "v2",
    title: "VIP-117 Risk Parameters Update",
    description: `
    TRX:
        Increase CF to 0.525 from 0.50
    SXP:
        Decrease CF to 0.0 from 0.125
    Reduce reserves in the SXP market
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [NEW_VTRX, parseUnits("0.525", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VSXP, 0],
      },

      {
        target: VSXP,
        signature: "_reduceReserves(uint256)",
        params: [VSXP_RESERVES],
      },

      {
        target: SXP,
        signature: "transfer(address,uint256)",
        params: [TREASURY, VSXP_RESERVES],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [SXP, SXP_FOR_SWAPPING, BINANCE_SWAPPER_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
