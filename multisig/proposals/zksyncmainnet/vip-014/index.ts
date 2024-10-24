import { makeProposal } from "src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894";
export const VUSDC_E_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const VUSDT_CORE = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
export const VWETH_CORE = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";

export const vip014 = () => {
  return makeProposal([
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VWETH_CORE, VWBTC_CORE, VUSDT_CORE, VUSDC_E_CORE, VZK_CORE],
        ["370370370370370", "370370370370370", "277777777777777", "555555555555555", "277777777777777"],
        ["92592592592592", "92592592592592", "69444444444444", "138888888888888", "69444444444444"],
      ],
    },
  ]);
};

export default vip014;
