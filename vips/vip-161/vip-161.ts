import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const DEFI_POOL = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VANKRBNB_DEFI = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const VTUSDOLD_INTEREST_RATE_MODEL = "0x574f056c1751ed5f3aa30ba04e550f4e6090c992";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKETS: 7,
};

export const vip160 = () => {
  const meta = {
    version: "v2",
    title: "VIP-160 Risk Parameters Update ",
    description: `
        VIP
          Set supply caps in BUSD market to 0
          Set borrow caps in BUSD market to 1
          Set reserve factor in BUSD market to 100%
          Pause the following actions in the BUSD market: mint, borrow, enter markets
          Set XVS reward to 0 in BUSD market 

          Reduce jump multiplier in TUSDOLD market from 2.5 to 0.5

          Increase supply cap by 2X to 10,000 in ankrBNB market of DeFi pool
        `,
    forDescription: "I agree that Venus Protocol should proceed with following changes",
    againstDescription: "I do not think that Venus Protocol should proceed with following changes",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with following changes or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VBUSD], [0]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VBUSD], [1]],
      },

      {
        target: VBUSD,
        signature: "_setReserveFactor(uint256)",
        params: [parseUnits("1", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VBUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKETS], true],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VBUSD], ["0"], ["0"]],
      },

      {
        target: VTUSDOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSDOLD_INTEREST_RATE_MODEL],
      },

      {
        target: DEFI_POOL,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VANKRBNB_DEFI], [parseUnits("10000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
