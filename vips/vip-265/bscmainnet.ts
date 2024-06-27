import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SINGLE_TOKEN_CONVERTER_BEACON = "0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca";
export const NEW_SINGLE_TOKEN_CONVERTER_IMP = "0x40ed28180Df01FdeB957224E4A5415704B9D5990";
export const NEW_RISK_FUND_CONVERTER_IMP = "0xd420Bf9C31F6b4a98875B6e561b13aCB19210647";
export const RISK_FUND_CONVERTER_PROXY = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

export const PROXY_ADMIN_LIQUIDATOR = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
export const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";

export const OLD_IMPL = "0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965";
export const TEMP_IMPL = "0x3aD4b5677AdC2a6930B2A08f443b9B3c6c605CD8";
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

export const vip265 = (data?: string) => {
  const meta = {
    version: "v2",
    title: "VIP-265 Fix on token converters and liquidator",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Upgrade the implementation contracts of the Token converters enabled at [VIP-248](https://app.venus.io/#/governance/proposal/248)
- Set the address of the [ProtocolShareReserve](https://bscscan.com/address/0xCa01D5A9A248a830E9D93231e791B1afFed7c446) contract in the [Liquidator](https://bscscan.com/address/0x0870793286aaDA55D39CE7f82fb2766e8004cF43) contract
- Transfer the ownership of the Liquidator contract to the [Normal timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396)

#### Description

The upgrade of the Token converter contracts fixes a rounding issue that avoids converting in one transaction 100% of the funds held by a converter at that moment. No funds are at risk.

[VIP-258](https://app.venus.io/#/governance/proposal/258) upgraded the implementation of the Liquidator contract. Since then, the vTokens seized and allocated to the protocol are redeemed during the liquidations, and the underlying tokens are sent to the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9). That was an intermediary step to reduce the risks. This VIP changes that destination contract to the ProtocolShareReserve contract, where the distribution rules of the [Venus Tokenomics](https://docs-v4.venus.io/governance/tokenomics) are defined.

Finally, also on [VIP-258](https://app.venus.io/#/governance/proposal/258), the ownership of the Liquidator contract was transferred to the [ProxyAdmin contract](https://bscscan.com/address/0x2b40b43ac5f7949905b0d2ed9d6154a8ce06084a). This VIP will transfer that ownership to the Normal timelock contract, to facilitate the execution of privilege functions in the future.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Configuration post VIP**: in a simulation environment, validating the upgrade of the Token converters, and the ProtocolShareReserve address set in the Liquidator are correct after the VIP.
- **Release funds**: in a simulation environment, validating the private conversions can be performed now, including 100% of the balances held by converters.
- **Deployment on testnet**: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- **Audit**: OpenZeppelin and Certik have audited the fix on the Token converters.

#### Audit reports

- [OpenZeppelin report (2024/02/20)](https://github.com/VenusProtocol/protocol-reserve/blob/ba39ce060d0716be1131913e4dd6e93c1444e0c3/audits/082_privateConversions_openzeppelin_20240220.pdf)
- [Certik audit report (2024/02/15)](https://github.com/VenusProtocol/protocol-reserve/blob/ba39ce060d0716be1131913e4dd6e93c1444e0c3/audits/081_privateConversions_certik_20240215.pdf)

#### Deployed contracts to mainnet

- [New SingleTokenConverter implementation](https://bscscan.com/address/0x40ed28180Df01FdeB957224E4A5415704B9D5990)
- [New RiskFundConverter implementation](https://bscscan.com/address/0xd420Bf9C31F6b4a98875B6e561b13aCB19210647)

#### References

- [VIP-245 Token converter: deployment stage 1/2](https://app.venus.io/#/governance/proposal/245)
- [VIP-248 Token converter: deployment stage 2/2](https://app.venus.io/#/governance/proposal/248)
- [VIP-258 Liquidator contract upgrade - Automatic Income Allocation](https://app.venus.io/#/governance/proposal/258)
- [VIP executed on testnet](https://testnet.bscscan.com/tx/0x0f8aa400d7de5c91d63214a84f97022083361be001a129802cd1ad82738313a2)
- [Pull request with the Token converters fix](https://github.com/VenusProtocol/protocol-reserve/pull/71)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/201)
- [Documentation](https://docs-v4.venus.io/whats-new/token-converter)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN_LIQUIDATOR,
        signature: "upgradeAndCall(address,address,bytes)",
        params: [LIQUIDATOR_CONTRACT, TEMP_IMPL, data],
      },
      {
        target: PROXY_ADMIN_LIQUIDATOR,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR_CONTRACT, OLD_IMPL],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_CONVERTER_PROXY, NEW_RISK_FUND_CONVERTER_IMP],
      },
      {
        target: SINGLE_TOKEN_CONVERTER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_SINGLE_TOKEN_CONVERTER_IMP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip265;
