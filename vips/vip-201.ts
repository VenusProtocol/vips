import { ProposalType } from "./../src/types";
import { makeProposal } from "./../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vTUSD_OLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const INTEREST_RATE_MODEL = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
const USDT_StableCoins_IR = "0x7dc969122450749A8B0777c0e324522d67737988";
const vPLANET_DeFi = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const DeFi_Pool = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";

export const vip201 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-201 Update multiplierPerBlock in interestRateModel of USDC, USDT, DAI and TUSD in core pool and of USDT in StableCoin Pool and update risk parameters of PLANET in DeFi pool and of TUSDOLD",
    description: `#### Summary

If passed, according to chaos lab risk parameters update ,this VIP will set 
- the new interest rate model of USDC, USDT, DAI and TUSD in core pool and update the multiplierPerBlock parameter of interest rate model of USDT in StableCoin Pool .
- Increases the supply and borrow rate of PLANET market of DeFi pool.
- Decreases borrow Rate of TUSDOLD to 0.


#### Description

Updated Risk Parameters:

multipierPerYear USDT = 6.875%
multipierPerYear USDC = 6.875%
multipierPerYear TUSD = 6.875%
multipierPerYear DAI = 6.875%

SupplyCap of PLANET(DeFi) market = 2,000,000,000
BorrowCap of PLANET(DeFi) market = 1,000,000,000

BorrowCap of TUSDOLD = 0
`,
    forDescription: "I agree that Venus Protocol should proceed with the updated risk parameters",
    againstDescription: "I do not think that Venus Protocol should proceed with the updated risk parameters",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the  updated risk parameters or not",
  };

  return makeProposal(
    [
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [INTEREST_RATE_MODEL],
      },
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [INTEREST_RATE_MODEL],
      },
      {
        target: vDAI,
        signature: "_setInterestRateModel(address)",
        params: [INTEREST_RATE_MODEL],
      },
      {
        target: vTUSD,
        signature: "_setInterestRateModel(address)",
        params: [INTEREST_RATE_MODEL],
      },
      {
        target: USDT_StableCoins_IR,
        signature: "updateJumpRateModel(uint256,uint256,uint256,uint256)",
        params: [0, "68749999993152000", "2499999999997536000", "800000000000000000"],
      },
      {
        target: DeFi_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPLANET_DeFi], ["2000000000000000000000000000"]],
      },
      {
        target: DeFi_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vPLANET_DeFi], ["1000000000000000000000000000"]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vTUSD_OLD], [0]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
