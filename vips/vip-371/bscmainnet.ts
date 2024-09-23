import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vETH = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";
export const vweETH = "0xc5b24f347254bD8cF8988913d1fd0F795274900F";
export const vwstETH = "0x94180a3948296530024Ef7d60f60B85cfe0422c8";
export const COMPTROLLER = "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529";
export const ETH_SUPPLY_CAP = parseUnits("3600", 18);
export const ETH_BORROW_CAP = parseUnits("3250", 18);
export const weETH_SUPPLY_CAP = parseUnits("120", 18);
export const weETH_BORROW_CAP = parseUnits("60", 18);
export const wstETH_SUPPLY_CAP = parseUnits("3200", 18);
export const wstETH_BORROW_CAP = parseUnits("320", 18);

const vip371 = () => {
  const meta = {
    version: "v2",
    title: "VIP-371 [BNB] Risk Parameters Adjustments (ETH, wstETH, weETH)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 09/23/24](https://community.venus.io/t/support-lido-wsteth-token-in-a-new-venus-protocol-bnbchain-lst-eth-pool/4526/8).

- [ETH (Liquid Staked ETH)](https://bscscan.com/address/0xeCCACF760FEA7943C5b0285BD09F601505A29c05)
    - Increase supply cap from 450 ETH to 3,600 ETH
    - Increase borrow cap from 400 ETH to 3,250 ETH
- [wstETH (Liquid Staked ETH)](https://bscscan.com/address/0x94180a3948296530024Ef7d60f60B85cfe0422c8)
    - Increase supply cap from 50 wstETH to 3,200 wstETH
    - Increase borrow cap from 5 wstETH to 320 wstETH
- [weETH (Liquid Staked ETH)](https://bscscan.com/address/0xc5b24f347254bD8cF8988913d1fd0F795274900F)
    - Decrease supply cap from 400 weETH to 120 weETH
    - Decrease borrow cap from 200 weETH to 60 weETH

This VIP should be executed after executing the [VIP-370](https://app.venus.io/#/governance/proposal/370?chainId=56), where the affected markets will be enabled.

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/356)
- [VIP-370: Add Liquid Staked ETH pool to BNB chain](https://app.venus.io/#/governance/proposal/370?chainId=56)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vETH, vweETH, vwstETH],
          [ETH_SUPPLY_CAP, weETH_SUPPLY_CAP, wstETH_SUPPLY_CAP],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vETH, vweETH, vwstETH],
          [ETH_BORROW_CAP, weETH_BORROW_CAP, wstETH_BORROW_CAP],
        ],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip371;
