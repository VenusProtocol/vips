import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const vPLANET = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};
export const RESERVE_FACTOR = parseUnits("1", 18);
export const COLLATERAL_FACTOR = 0;
export const LIQUIDATION_THRESHOLD = parseUnits("0.15", 18);
export const vPLANET_SUPPLY_CAP = 0;
export const vPLANET_BORROW_CAP = 0;

export const vip424 = () => {
  const meta = {
    version: "v2",
    title: "VIP-424 Risk Parameters Adjustment (PLANET)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - PLANET Deprecation](https://community.venus.io/t/chaos-labs-planet-deprecation/4833).

- Pause supply, borrow and enter market actions in the [vPLANET market](https://bscscan.com/address/0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be)
- Set borrow and supply caps to 0
- Increase vPLANET Reserve Factor to 100%
- Reduce CF from 20% to 0%
- Reduce LT from 30% to 15%

Review the Chaos Labs’ recommendations for a deeper analysis.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/459](https://github.com/VenusProtocol/vips/pull/459)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFI_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vPLANET], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: vPLANET,
        signature: "setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vPLANET, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vPLANET], [vPLANET_BORROW_CAP]],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPLANET], [vPLANET_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip424;
