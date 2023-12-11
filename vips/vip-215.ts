import { BigNumber } from "ethers";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export interface MarketInformation {
  name: string;
  vToken: string;
  underlying: string;
  badDebt: string;
  initialBalance?: BigNumber;
}

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";

const markets: MarketInformation[] = [
  {
    name: "ankrBNB",
    vToken: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    underlying: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    badDebt: "108890115080027695179", // 108.890115080027695179
  },
  {
    name: "BNBx",
    vToken: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    underlying: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
    badDebt: "654859606916027127141", // 654.859606916027127141
  },
  {
    name: "stkBNB",
    vToken: "0xcc5D9e502574cda17215E70bC0B4546663785227",
    underlying: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    badDebt: "46887992971984503730", // 46.88799297198450373
  },
  {
    name: "WBNB",
    vToken: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    badDebt: "275071884556669618361", // 275.071884556669618361
  },
];

export const vip215 = () => {
  const meta = {
    version: "v2",
    title: "VIP-215 ",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    markets.flatMap(marketInfo => [
      {
        target: marketInfo.vToken,
        signature: "setShortfallContract(address)",
        params: [TIMELOCK],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketInfo.underlying, marketInfo.badDebt, marketInfo.vToken],
      },
      {
        target: marketInfo.vToken,
        signature: "badDebtRecovered(uint256)",
        params: [marketInfo.badDebt],
      },
      {
        target: marketInfo.vToken,
        signature: "setShortfallContract(address)",
        params: [SHORTFALL],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};
