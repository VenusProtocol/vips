import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ZK_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

export const vUSDC_E = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const vUSDC = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";

export const vXRP_BORROW_CAP = parseUnits("6000000", 18);
export const vUNI_SUPPLY_CAP = parseUnits("990000", 18);
export const vUSDC_COLLATERAL_FACTOR = parseUnits("0.75", 18);
export const vUSDC_LIQUIDATION_THRESHOLD = parseUnits("0.78", 18);

export const vip423 = () => {
  const meta = {
    version: "v2",
    title: "VIP-423 Risk Parameters Adjustments (UNI, XRP, USDC.e, USDC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 1/11/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-1-11-25/4829).

ZKsync Era:

- [USDC.e (Core pool)](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D), and [USDC (Core pool)](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a):
    - Increase Collateral Factor, from 72% to 75%
    - Increase Liquidation Threshold, from 75% fo 78%

BNB Chain:

- [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)
    - Increase supply cap, from 900K UNI to 990K UNI
- [XRP (Core pool)](https://bscscan.com/address/0xB248a295732e0225acd3337607cc01068e3b9c10)
    - Increase borrow cap, from 3M XRP to 6M XRP

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/458](https://github.com/VenusProtocol/vips/pull/458)`,
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
        target: BNB_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vXRP], [vXRP_BORROW_CAP]],
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDC_E, vUSDC_COLLATERAL_FACTOR, vUSDC_LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDC, vUSDC_COLLATERAL_FACTOR, vUSDC_LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip423;
