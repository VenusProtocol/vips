import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETHEREUM_vBAL_CORE = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
export const ETHEREUM_vBAL_CORE_SUPPLY_CAP = parseUnits("3000000", 18);

export const ETHEREUM_LST_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const ETHEREUM_vpufETH_LST = "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e";
export const ETHEREUM_vpufETH_LST_BORROW_CAP = parseUnits("600", 18);

export const BNB_GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const BNB_vFLOKI_CORE = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const BNB_vFLOKI_CORE_BORROW_CAP = parseUnits("32000000000", 9);

export const vip455 = () => {
  const meta = {
    version: "v2",
    title: "VIP-455 [BNB Chain][Ethereum] Risk Parameters Adjustments (FLOKI, BAL, pufETH)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 2/19/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-2-19-25).

- BNB Chain / [FLOKI (GameFi pool)](https://bscscan.com/address/0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb):
    - Increase borrow cap, from 16,000,000,000 FLOKI to 32,000,000,000 FLOKI
- Ethereum / [BAL (Core pool)](https://etherscan.io/address/0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8):
    - Increase supply cap, from 2M BAL to 3M BAL
- Ethereum / [pufETH (Liquid Staked ETH pool)](https://etherscan.io/address/0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e):
    - Increase borrow cap, from 300 pufETH to 600 pufETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/507](https://github.com/VenusProtocol/vips/pull/507)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ETHEREUM_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[ETHEREUM_vBAL_CORE], [ETHEREUM_vBAL_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_LST_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[ETHEREUM_vpufETH_LST], [ETHEREUM_vpufETH_LST_BORROW_CAP]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BNB_GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[BNB_vFLOKI_CORE], [BNB_vFLOKI_CORE_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip455;
