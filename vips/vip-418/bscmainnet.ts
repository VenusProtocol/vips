import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC_E_SUPPLY_CAP = parseUnits("24000000", 6);
export const ZK_SUPPLY_CAP = parseUnits("200000000", 18);

export const VZK_CORE_COLLATERAL_FACTOR = parseUnits("0.4", 18);
export const VZK_CORE_LIQUIDATION_THRESHOLD = parseUnits("0.45", 18);

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_E_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";

export const vip418 = () => {
  const meta = {
    version: "v2",
    title: "VIP-418 [ZKsync] Risk Parameters Adjustments (USDC.e, ZK)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 1/6/2025](https://community.venus.io/t/chaos-labs-risk-parameter-updates-1-6-2025/4815).

- [ZK (Core pool)](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616):
    - Increase supply cap, from 100M ZK to 200M ZK
    - Increase Collateral Factor, from 0.35 to 0.4
    - Increase Liquidation Threshold, from 0.4 to 0.45
- [USDC.e (Core pool)](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D):
    - Increase supply cap, from 12M USDC.e to 24M USDC.e

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/454](https://github.com/VenusProtocol/vips/pull/454)`,
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
          [VUSDC_E_CORE, VZK_CORE],
          [USDC_E_SUPPLY_CAP, ZK_SUPPLY_CAP],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VZK_CORE, VZK_CORE_COLLATERAL_FACTOR, VZK_CORE_LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip418;
