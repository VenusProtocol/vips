import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip294 = () => {
  const meta = {
    version: "v2",
    title: "VIP-294 Ethereum: add support for DAI market on Venus Core Pool",
    description: `#### Summary

If passed, following the Community proposal “[DAI Listing Proposal for Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/dai-listing-proposal-for-venus-protocol-on-ethereum-mainnet/4244)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x9388cc2d4225246771a3cc89d887e7544b9d4aacb693deb8a4293b7d31ee02c5), this VIP adds a market for the [DAI token](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f) into the [Venus Core Pool on Ethereum](https://etherscan.io/address/0x687a01ecF6d3907658f7A7c714749fAC32336D1B).

Moreover, this VIP transfers 5,000 USDT to the [Community Wallet](https://etherscan.io/address/0xc444949e0054a23c44fc45789738bdf64aed2391), to refund the [DAI tokens provided](https://etherscan.io/tx/0x7e7fff1d1a7398014c58f58be7aadb9d73a869a9f1db505d8ca2dd26068e3711) for the bootstrap liquidity of the new market.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/dai-listing-proposal-for-venus-protocol-on-ethereum-mainnet/4244/6), the risk parameters for the new markets are:

- Underlying token: [DAI](https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f)
- Borrow cap: 45,000,000 DAI
- Supply cap: 50,000,000 DAI
- Collateral factor: 75%
- Liquidation threshold: 77%
- Reserve factor: 10%

Bootstrap liquidity: 5,000 DAI - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

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

- **Mainnet DAI market (vDAI)**: [0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657](https://etherscan.io/address/0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657)
- **Testnet DAI market (vDAI)**: [0xfe050f628bF5278aCfA1e7B13b59fF207e769235](https://sepolia.etherscan.io/address/0xfe050f628bF5278aCfA1e7B13b59fF207e769235)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/266)
- [Testnet deployment](https://sepolia.etherscan.io/tx/0x1f524ad3ed27aa26903f907acc05ae2937e45bca932f1d34af086bdb9775a14e)
- Community post “[DAI Listing Proposal for Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/dai-listing-proposal-for-venus-protocol-on-ethereum-mainnet/4244)”
- Snapshot “[Support DAI as collateral on Venus on ETH Mainnet](https://snapshot.org/#/venus-xvs.eth/proposal/0x9388cc2d4225246771a3cc89d887e7544b9d4aacb693deb8a4293b7d31ee02c5)”
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this multisig transaction](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xdf09c5b2a4ef0bc53e4db83d5ffffc93b17b7762f2d6ba2636be51339fca47d8) will be executed. Otherwise, it will be rejected.`,
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

export default vip294;
