import { makeProposal } from "../../../../src/utils";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF" // TODO: verify
export const TX_2_CALLDATA = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba" // TODO: update
export const COMPTROLLER= "0xfd36e2c2a6789db23113685031d7f16329158384"

export const Actions = {
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
};

const vip000 = () => {
  return makeProposal([
    {
      target: COMPTROLLER,
      signature: "_setActionsPaused(address[],uint8[],bool)",
      params: [[VBTC], [Actions.LIQUIDATE], false],
    },
    {
      target: COMPTROLLER,
      signature: "_setActionsPaused(address[],uint8[],bool)",
      params: [[VUSDC, VUSDT, VWBETH, VFDUSD], [Actions.SEIZE, Actions.TRANSFER], false],
    },
    {
      target: ORACLE_GUARDIAN,
      signature: "",
      params: [],
      data: TX_2_CALLDATA,
    },
    {
      target: COMPTROLLER,
      signature: "_setActionsPaused(address[],uint8[],bool)",
      params: [[VBTC], [Actions.LIQUIDATE], true],
    },
    {
      target: COMPTROLLER,
      signature: "_setActionsPaused(address[],uint8[],bool)",
      params: [[VUSDC, VUSDT, VWBETH, VFDUSD], [Actions.SEIZE, Actions.TRANSFER], true],
    },
  ]);
};

export default vip000;
