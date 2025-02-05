import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC_E_SUPPLY_CAP = parseUnits("12000000", 6);
export const USDC_E_BORROW_CAP = parseUnits("10800000", 6);
export const ZK_SUPPLY_CAP = parseUnits("100000000", 18);

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_E_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";

export const vip417 = () => {
  const meta = {
    version: "v2",
    title: "VIP-417 [ZKsync] Risk Parameters Adjustments (USDC.e, ZK)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 1/5/2025](https://community.venus.io/t/chaos-labs-risk-parameter-updates-1-5-2025/4811).

- [ZK (Core pool)](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616):
    - Increase supply cap, from 50M ZK to 100M ZK
- [USDC.e (Core pool)](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D):
    - Increase supply cap, from 6M USDC.e to 12M USDC.e
    - Increase borrow cap, from 5.4M USDC.e to 10.8M USDC.e

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/453](https://github.com/VenusProtocol/vips/pull/453)`,
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
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VUSDC_E_CORE], [USDC_E_BORROW_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip417;
