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

export const vip534 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-534 [BNB Chain] Risk Parameters Adjustments (Liquid Staked ETH assets on BNB Chain)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Isolated Instance Parameter Updates - 07/17/25](https://community.venus.io/t/chaos-labs-isolated-instance-parameter-updates-07-17-25/5226):

- [ETH (Liquid Staked ETH)](https://app.venus.io/#/pools/pool/0xBE609449Eb4D76AD8545f957bBE04b596E8fC529/market/0xeCCACF760FEA7943C5b0285BD09F601505A29c05?chainId=56):
    - reduce the supply cap, from 3,600 ETH to 18 ETH
    - reduce the borrow cap, from 3,250 ETH to 10 ETH
- [wstETH (Liquid Staked ETH)](https://app.venus.io/#/pools/pool/0xBE609449Eb4D76AD8545f957bBE04b596E8fC529/market/0x94180a3948296530024Ef7d60f60B85cfe0422c8?chainId=56):
    - reduce the supply cap, from 3,200 wstETH to 10.75 wstETH
    - reduce the borrow cap, from 320 wstETH to 0 wstETH
    - increase the Collateral Factor, from 0% to 5%
- [weETH (Liquid Staked ETH)](https://app.venus.io/#/pools/pool/0xBE609449Eb4D76AD8545f957bBE04b596E8fC529/market/0xc5b24f347254bD8cF8988913d1fd0F795274900F?chainId=56):
    - reduce the supply cap, from 120 weETH to 4 weETH
    - reduce the borrow cap, from 60 weETH to 0 weETH
    - increase the Collateral Factor, from 0% to 5%

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/595)`,
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
    ProposalType.FAST_TRACK,
  );
};

export default vip534;
