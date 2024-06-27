import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VTUSDOLD = "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0";
const DEFI_POOL = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const VANKRBNB_DEFI = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
const VTUSDOLD_INTEREST_RATE_MODEL = "0xfB14Dd85A26e41E4fD62b3B142b17f279c7Bb8B0";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKETS: 7,
};

export const vip161Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-161 Risk Parameters Update ",
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
