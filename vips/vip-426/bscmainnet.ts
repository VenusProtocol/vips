import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC_SUPPLY_CAP = parseUnits("15000000", 6);
export const USDC_BORROW_CAP = parseUnits("13500000", 6);

export const ZK_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const VUSDC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";

export const vip426 = () => {
  const meta = {
    version: "v2",
    title: "VIP-426 [ZKsync] Risk Parameters Adjustments (USDC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 1/19/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-1-19-25/4836).

- [USDC (Core pool)](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a):
    - Increase supply cap, from 6M USDC to 15M USDC
    - Increase borrow cap, from 5.4M USDC to 13.5M USDC

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/461](https://github.com/VenusProtocol/vips/pull/461)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VUSDC_CORE], [USDC_SUPPLY_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VUSDC_CORE], [USDC_BORROW_CAP]],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip426;
