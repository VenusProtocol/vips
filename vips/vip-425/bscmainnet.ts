import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC_SUPPLY_CAP = parseUnits("6000000", 6);
export const USDC_BORROW_CAP = parseUnits("5400000", 6);
export const WBTC_SUPPLY_CAP = parseUnits("62", 8);
export const WBTC_BORROW_CAP = parseUnits("31", 8);

export const ZK_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";

export const vip425 = () => {
  const meta = {
    version: "v2",
    title: "VIP-425 [ZKsync] Risk Parameters Adjustments (USDC, WBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 1/17/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-1-17-25/4834).

- [WBTC (Core pool)](https://explorer.zksync.io/address/0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719):
    - Increase supply cap, from 40 WBTC to 62 WBTC
    - Increase borrow cap, from 20 WBTC to 31 WBTC
- [USDC (Core pool)](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a):
    - Increase supply cap, from 1.25M USDC to 6M USDC
    - Increase borrow cap, from 1M USDC to 5.4M USDC

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/460](https://github.com/VenusProtocol/vips/pull/460)`,
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
          [VUSDC_CORE, VWBTC_CORE],
          [USDC_SUPPLY_CAP, WBTC_SUPPLY_CAP],
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

export default vip425;
