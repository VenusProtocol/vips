import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBTCB = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const IRM = "0xbFF70a96B8F4F2d5BdFB71fC74eb9572F422d500";
export const RESERVE_FACTOR = parseUnits("0.3", 18);
export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const SUPPLY_CAP = parseUnits("1375", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip539 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-539 [BNB Chain] Risk Parameters Adjustments (BTCB, xSolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publications [Proposal: Adjustment of BTCB Interest Rate Model (IRM) on Venus](https://community.venus.io/t/proposal-adjustment-of-btcb-interest-rate-model-irm-on-venus/5268/7) and [Chaos Labs - Risk Parameter Updates - 8/25/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-8-25-25/5281):

- [BTCB (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B?chainId=56):
    - update the following parameters of the Interest Rate Model:
        - Annual Base Rate: from 0% to 0.25%
        - Multiplier (annualized): from 9% to 3.67%
    - Reserve Factor: from 20% to 30%
- [xSolvBTC (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xd804dE60aFD05EE6B89aab5D152258fD461B07D5?chainId=56):
    - increase supply cap, from 1,250 xSolvBTC to 1,375 xSolvBTC

Complete analysis and details of this recommendation are available in the above publications.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/602)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vBTCB,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vBTCB,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vxSolvBTC], [SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip539;
