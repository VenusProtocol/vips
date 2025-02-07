import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC_SUPPLY_CAP = parseUnits("30000000", 6);
export const USDC_BORROW_CAP = parseUnits("27000000", 6);
export const WBTC_SUPPLY_CAP = parseUnits("70", 8);
export const WBTC_BORROW_CAP = parseUnits("35", 8);
export const ZK_SUPPLY_CAP = parseUnits("300000000", 18);

export const ZK_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";

export const vip428 = () => {
  const meta = {
    version: "v2",
    title: "VIP-428 [ZKsync] Risk Parameters Adjustments (USDC, WBTC, ZK)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 1/21/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-1-21-25/4838).

- [WBTC (Core pool)](https://explorer.zksync.io/address/0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719):
    - Increase supply cap, from 62 WBTC to 70 WBTC
    - Increase borrow cap, from 31 WBTC to 35 WBTC
- [USDC (Core pool)](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a):
    - Increase supply cap, from 15M USDC to 30M USDC
    - Increase borrow cap, from 13.5M USDC to 27M USDC
- [ZK (Core pool)](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616):
    - Increase supply cap, from 200M ZK to 300M ZK

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/466](https://github.com/VenusProtocol/vips/pull/466)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [VUSDC_CORE, VWBTC_CORE, VZK_CORE],
          [USDC_SUPPLY_CAP, WBTC_SUPPLY_CAP, ZK_SUPPLY_CAP],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [VUSDC_CORE, VWBTC_CORE],
          [USDC_BORROW_CAP, WBTC_BORROW_CAP],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip428;
