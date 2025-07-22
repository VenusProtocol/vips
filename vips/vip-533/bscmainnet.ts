import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const liquidStakedETH_Comptroller = "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529";

export const vETH_LiquidStakedETH = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";
export const ETH_SUPPLY_CAP = parseUnits("18", 18);
export const ETH_BORROW_CAP = parseUnits("10", 18);

export const vweETH_LiquidStakedETH = "0xc5b24f347254bD8cF8988913d1fd0F795274900F";
export const wstETH_SUPPLY_CAP = parseUnits("10.75", 18);
export const wstETH_BORROW_CAP = parseUnits("0", 18);
export const wstETH_CF = parseUnits("0.05", 18);
export const wstETH_LIQUIDATION_THRESHOLD = parseUnits("0.93", 18);

export const vwstETH_LiquidStakedETH = "0x94180a3948296530024Ef7d60f60B85cfe0422c8";
export const weETH_SUPPLY_CAP = parseUnits("4", 18);
export const weETH_BORROW_CAP = parseUnits("0", 18);
export const weETH_CF = parseUnits("0.05", 18);
export const weETH_LIQUIDATION_THRESHOLD = parseUnits("0.93", 18);

export const vip533 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-533 [BNB Chain] Chaos labs recommendations (June 17th, 2025)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Isolated Instance Parameter Updates - 07/17/25](https://community.venus.io/t/chaos-labs-isolated-instance-parameter-updates-07-17-25/5226):

Complete analysis and details of this recommendation are available in the above publication.

#### References
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: liquidStakedETH_Comptroller,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vETH_LiquidStakedETH, vweETH_LiquidStakedETH, vwstETH_LiquidStakedETH],
          [ETH_SUPPLY_CAP, weETH_SUPPLY_CAP, wstETH_SUPPLY_CAP],
        ],
      },
      {
        target: liquidStakedETH_Comptroller,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vETH_LiquidStakedETH, vweETH_LiquidStakedETH, vwstETH_LiquidStakedETH],
          [ETH_BORROW_CAP, weETH_BORROW_CAP, wstETH_BORROW_CAP],
        ],
      },
      {
        target: liquidStakedETH_Comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vweETH_LiquidStakedETH, weETH_CF, weETH_LIQUIDATION_THRESHOLD],
      },
      {
        target: liquidStakedETH_Comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vwstETH_LiquidStakedETH, wstETH_CF, wstETH_LIQUIDATION_THRESHOLD],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
