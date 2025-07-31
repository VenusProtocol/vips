import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON_BSC = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0xF96363e03D175eEcc6A965f117e1497EAe878d29";
export const SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM = "0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x560E50dc157E7140C0E5bdF46e586c658C8A066c";
export const SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM = "0x993900Ab4ef4092e5B76d4781D09A2732086F0F0";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0x2EE413F4e060451CB25AeD5Cdd348F430aa79105";

export const vip536 = () => {
  const meta = {
    version: "v2",
    title: "VIP-3328 upgrades the implementation of token converters",
    description: `
        This VIP upgrades the implementation of SingleTokenConverter for bsc, ethereum and arbitrum.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_BSC,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC],
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip536;
