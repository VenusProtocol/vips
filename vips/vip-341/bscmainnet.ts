import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip341 = () => {
  const meta = {
    version: "v2",
    title: "VIP-341 [Ethereum] Provide the XVS Vault rewards for 2024 Q3",
    description: `#### Summary

If passed, this VIP allows unlimited transfers of XVS from any network to the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) contract on Ethereum. Moreover, it will transfer 22,500 XVS from the XVS Vault Treasury contract to the [XVS Store](https://etherscan.io/address/0x1db646e1ab05571af99e47e8f909801e5c99d37b) contract, where the XVS Vault rewards are stored.

#### Description

In the [VIP-339](https://app.venus.io/#/governance/proposal/339), 45,000 XVS were transferred from the [Distributor contract on BNB Chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the XVS Vault Treasury on Ethereum. Due to the limits configured on the bridge contracts, the XVS tokens were not minted on Ethereum. This VIP will allow anyone to complete this transfer, by retrying the [failed bridge transaction](https://etherscan.io/tx/0x8778c81a4f12767f9c5901afa44a7471f1a76f1e0360ae1297cbc30b487245cf).

After successfully retrying the bridge operation, 45,000 XVS will be received by the XVS Vault Treasury contract on Ethereum. From this amount, in the context of this VIP, 22,500 XVS will be sent to the XVS Store contract, which is responsible for distributing rewards.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new configuration is the expected one and the funds are transferred to the XVS Store contract
- This VIP doesn’t upgrade any smart contract

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/325)
- [VIP-339 [Ethereum] : Venus Prime Deployment - Q3 2024](https://app.venus.io/#/governance/proposal/339)
- [Documentation](https://docs-v4.venus.io/governance/tokenomics)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x641b0438a70b2e62c6f85fb5b37805d79d74eb72101bf03a07b87ea184504d95) and [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x2690a9620cc99748ad46cb539d5345ced6277cc56af14efe6b10d17ad8cd80b1) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip341;
