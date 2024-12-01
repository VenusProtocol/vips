import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const eBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";

export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
export const XVS_ETHEREUM = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

const vip401 = () => {
  const meta = {
    version: "v2",
    title: "VIP-401 [Ethereum] Fix eBTC conversion on XVS Vault Converter",
    description: `#### Summary`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Conversion config
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [XVS_ETHEREUM, [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip401;
