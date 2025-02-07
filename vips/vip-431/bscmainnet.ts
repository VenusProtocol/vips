import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ZK_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";

export const vUNI_SUPPLY_CAP = parseUnits("1300000", 18);
export const WBTC_SUPPLY_CAP = parseUnits("90", 8);
export const WBTC_BORROW_CAP = parseUnits("45", 8);

export const vip431 = () => {
  const meta = {
    version: "v2",
    title: "VIP-431 [ZKsync][BNB Chain] Risk Parameters Adjustments (WBTC, UNI)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in these Venus community forum publications: [Chaos Labs - Risk Parameter Updates - 1/23/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-1-23-25/4840) and [Chaos Labs - Risk Parameter Updates #2 - 1/23/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-2-1-23-25/4841).

ZKsync Era:

- [WBTC (Core pool)](https://explorer.zksync.io/address/0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719):
    - Increase supply cap, from 70 WBTC to 90 WBTC
    - Increase borrow cap, from 35 WBTC to 45 WBTC

BNB Chain:

- [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)
    - Increase supply cap, from 990K UNI to 1.3M UNI

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/467](https://github.com/VenusProtocol/vips/pull/467)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vUNI], [vUNI_SUPPLY_CAP]],
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VWBTC_CORE], [WBTC_SUPPLY_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VWBTC_CORE], [WBTC_BORROW_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip431;
