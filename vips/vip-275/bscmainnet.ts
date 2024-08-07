import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const vip275 = () => {
  const meta = {
    version: "v2",
    title: "VIP-275 Token converters - enable public conversions USDT/XVS in the XVSVaultConverter",
    description: `#### Summary

If passed, this VIP will enable the public conversions of USDT/XVS in the [XVSVaultConverter](https://bscscan.com/address/0xd5b9AE835F4C59272032B3B954417179573331E0). The XVSVaultConverter will accept XVS (that will be transferred to the [XVSVaultTreasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a)), transferring USDT to the agent performing the conversion.

#### Description

Token converters were enabled in the [VIP-248](https://app.venus.io/#/governance/proposal/248). In the initial setup, the USDT in the XVSVaultConverter was enabled only for private conversions (conversions from other token converters). The goal was to avoid public conversions of USDT/XVS, because public conversions will have an incentive, increasing the cost for the protocol.

Ideally, the [RiskFundConverter](https://bscscan.com/address/0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0) and the [USDTPrimeConverter](https://bscscan.com/address/0xD9f101AA67F3D72662609a2703387242452078C3) (these converters only accept USDT in the conversions) would have XVS, and the private conversions could be performed between these converters and the XVSVaultConverter.

After more than one month operating the converters, the income generated by the protocol in XVS tokens is minimum. So, no private conversions USDT/XVS have been performed, and the XVSVaultConverter has accumulated around [105K USDT (March 20th, 2024)](https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955?a=0xd5b9AE835F4C59272032B3B954417179573331E0).

This VIP enables the conversions of USDT/XVS for everyone, not only for private conversions. This will allow to convert (permissionless) the USDT held by the XVSVaultConverter to XVS. The incentives in the conversions are still 0.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/238)
- [Documentation](https://docs-v4.venus.io/whats-new/token-converter)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfig(address,address,(uint256,uint8))",
        params: [XVS, USDT, [0, 1]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip275;
