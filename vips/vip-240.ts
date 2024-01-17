import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};
export const RESERVE_FACTOR = parseUnits("1", 18);
export const COLLATERAL_FACTOR = parseUnits(".65", 18);

export const vip240 = () => {
  const meta = {
    version: "v2",
    title: "VIP-240 TUSD market deprecation",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates - TUSD - 01/16/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-tusd-01-16-2023/4053).

- Pause supply, borrow and enter market actions in the [vTUSD market](https://bscscan.com/address/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E)
- Set XVS rewards in the vTUSD market to 0
- Increase vTUSD Reserve Factor to 100%
- Reduce CF from 75% to 65%

Review the Chaos Labs’ recommendations [Risk Parameter Updates - TUSD - 01/16/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-tusd-01-16-2023/4053), for a deeper analysis.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VTUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },

      {
        target: UNITROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VTUSD], ["0"], ["0"]],
      },

      {
        target: VTUSD,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },

      {
        target: UNITROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VTUSD, COLLATERAL_FACTOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
