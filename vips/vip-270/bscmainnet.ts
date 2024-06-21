import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const RESERVE_FACTOR = parseUnits("0.1", 18).toString();
export const COLLATERAL_FACTOR = parseUnits("0.75", 18).toString();
export const BORROW_CAP = parseUnits("1200000", 18).toString();
export const SUPPLY_CAP = parseUnits("1500000", 18).toString();
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const FD_USD_BORROW_CAP = parseUnits("16000000", 18).toString();
export const FD_USD_SUPPLY_CAP = parseUnits("20000000", 18).toString();
export const IL_COMPTROLLER = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
export const vlisUSD = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
export const lisUSD_SUPPLY_CAP = parseUnits("1000000", 18).toString();

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip270 = () => {
  const meta = {
    version: "v2",
    title: "VIP-270 Risk Parameters Adjustments (TUSD, FDUSD, lisUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in these Venus community forum publications:

- [Chaos Labs - Risk Parameter Updates - 03/07/24](https://community.venus.io/t/ext-chaos-labs-risk-parameter-updates-03-07-24/4192)
    - [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
        - Increase supply cap to 20,000,000 FDUSD
        - Increase borrow cap to 16,000,000 FDUSD
- [Chaos Labs - lisUSD Supply Cap Increase - 3/7/24](https://community.venus.io/t/chaos-labs-lisusd-supply-cap-increase-3-7-24/4190)
    - [lisUSD (Stablecoins isolated pool)](https://bscscan.com/address/0xCa2D81AA7C09A1a025De797600A7081146dceEd9)
        - Increase supply cap from 500,000 lisUSD to 1,000,000 lisUSD
- [Chaos Labs Risk Parameter Updates - TUSD - 4/3/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-tusd-4-3-24/4175)
    - [TUSD (Core pool)](https://bscscan.com/address/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E)
        - Unpause MINT, BORROW and ENTER_MARKET (will allow users to start using TUSD as collateral)
        - Reduce Reserve Factor from 100% to 10%
        - Increase Collateral Factor from 0% to 75%
        - Decrease Supply and Borrow Caps from 5M and 4M to 1.5M and 1.2M, respectively

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/226](https://github.com/VenusProtocol/vips/pull/226)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vTUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], false],
      },
      {
        target: vTUSD,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [vTUSD, COLLATERAL_FACTOR],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vTUSD, vFDUSD],
          [BORROW_CAP, FD_USD_BORROW_CAP],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vTUSD, vFDUSD],
          [SUPPLY_CAP, FD_USD_SUPPLY_CAP],
        ],
      },
      {
        target: IL_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vlisUSD], [lisUSD_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip270;
