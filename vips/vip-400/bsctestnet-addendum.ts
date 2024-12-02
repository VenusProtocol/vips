import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  CONVERTER_NETWORK,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../multisig/proposals/arbitrumsepolia/vip-019/Addresses";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = arbitrumsepolia;

export const ARBITRUM_SEPOLIA_XVS_VAULT_TREASURY = "0x309b71a417dA9CfA8aC47e6038000B1739d9A3A6";

const grant = (target: string, signature: string, caller: string): Command => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
  dstChainId: LzChainId.arbitrumsepolia,
});

const converters = [
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
];

const vip400Addendum = () => {
  const meta = {
    version: "v2",
    title: "vip400 addendum - arbitrum sepolia Prime configuration",
    description: `Extend permissions to FAST_TRACK and CRITICAL timelocks on the privilege commands of Converters, ConverterNetwork and XVSVaultTreasury`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...[FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(timelock => [
        grant(CONVERTER_NETWORK, "addTokenConverter(address)", timelock),
        grant(CONVERTER_NETWORK, "removeTokenConverter(address)", timelock),
        grant(ARBITRUM_SEPOLIA_XVS_VAULT_TREASURY, "fundXVSVault(uint256)", timelock),
      ]),
      ...converters.flatMap(converter => [
        ...[FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(timelock => [
          grant(converter, "setConversionConfig(address,address,ConversionConfig)", timelock),
          grant(converter, "pauseConversion()", timelock),
          grant(converter, "resumeConversion()", timelock),
          grant(converter, "setMinAmountToConvert(uint256)", timelock),
        ]),
        grant(converter, "pauseConversion()", GUARDIAN),
        grant(converter, "resumeConversion()", GUARDIAN),
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400Addendum;
