import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip296 = () => {
  const meta = {
    version: "v2",
    title: "VIP-296 Ethereum: add support for TUSD market on Venus Core Pool",
    description: `#### Summary

If passed, following the Community proposal “[Proposal: Support TUSD collateral on Venus on ETH Mainnet](https://community.venus.io/t/proposal-support-tusd-collateral-on-venus-on-eth-mainnet/4237)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x852b88fb5273b23bb3e3776caa7c70c59cdaa829f85338b6ff1a2162778d95f5), this VIP adds a market for the [TUSD token](https://etherscan.io/token/0x0000000000085d4780B73119b644AE5ecd22b376) into the [Venus Core Pool on Ethereum](https://etherscan.io/address/0x687a01ecF6d3907658f7A7c714749fAC32336D1B).

Moreover, this VIP transfers 5,000 USDT to the [Community Wallet](https://etherscan.io/address/0xc444949e0054a23c44fc45789738bdf64aed2391), to refund the [TUSD tokens provided](https://etherscan.io/tx/0xef9ee797a38525feb246af5f88d29f29baeffa1fdf5d62a2dbecb7578f63a90c) for the bootstrap liquidity of the new market.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-support-tusd-collateral-on-venus-on-eth-mainnet/4237/7), the risk parameters for the new markets are:

- Underlying token: [TUSD](https://etherscan.io/token/0x0000000000085d4780B73119b644AE5ecd22b376)
- Borrow cap: 1,800,000 TUSD
- Supply cap: 2,000,000 TUSD
- Collateral factor: 75%
- Liquidation threshold: 77%
- Reserve factor: 10%

Bootstrap liquidity: 5,000 TUSD - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0
- multiplier (yearly): 15%
- jump multiplier (yearly): 250%

#### Security and additional considerations

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the core pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- **Mainnet TUSD market (vTUSD)**: [0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b](https://etherscan.io/address/0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b)
- **Testnet TUSD market (vTUSD)**: [0xE23A1fC1545F1b072308c846a38447b23d322Ee2](https://sepolia.etherscan.io/address/0xE23A1fC1545F1b072308c846a38447b23d322Ee2)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/267)
- [Testnet deployment](https://sepolia.etherscan.io/tx/0x3560bd0036c319690a822330048cac0fc936269261a881d3fd22e8b82994cbc1#eventlog)
- Community post “[Proposal: Support TUSD collateral on Venus on ETH Mainnet](https://community.venus.io/t/proposal-support-tusd-collateral-on-venus-on-eth-mainnet/4237)”
- Snapshot “[Support TUSD as collateral on Venus on ETH Mainnet](https://snapshot.org/#/venus-xvs.eth/proposal/0x852b88fb5273b23bb3e3776caa7c70c59cdaa829f85338b6ff1a2162778d95f5)”
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x2ef06bcef7e13b56313a06308b240935379570ffea8bd0cee57f1d94e021e7d1) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip296;
