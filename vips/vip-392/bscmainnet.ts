import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const vip392 = () => {
  const meta = {
    version: "v2",
    title: "VIP-392 [zkSync] New native USDC market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[Support native USDC on Venus Core Pool of ZKSync Era](https://community.venus.io/t/support-native-usdc-on-venus-core-pool-of-zksync-era/4611)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xcb25dcc1ea932f9bd6d5bdc531c09933f29281b7dd38c79e33560819fbf2b47b), this VIP adds a market for [native USDC](https://explorer.zksync.io/address/0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4) into the Core pool on zkSync Era, and refunds the [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) the provided bootstrap liquidity.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/support-native-usdc-on-venus-core-pool-of-zksync-era/4611/6), the risk parameters for the new market are:

Underlying token: [USDC](https://explorer.zksync.io/address/0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4)

- Borrow cap: 1,000,000
- Supply cap: 1,250,000
- Collateral factor: 72%
- Liquidation threshold: 75%
- Reserve factor: 10%

Bootstrap liquidity: 4,998.38 USDC - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 8.75%
- jump multiplier (yearly): 80%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [zkSync Era](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182) is used for USDC, with the [Chainlink feed](https://explorer.zksync.io/address/0x1824D297C6d6D311A204495277B63e943C2D376E) for this asset as the main oracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on zkSync Era, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to zkSync sepolia, and used in the Venus Protocol testnet deployment

The Community Wallet [provided the bootstrap liquidity](https://explorer.zksync.io/tx/0x3c025522063877bc90ad418d39c97a2116974e21b5d0c79af5dafedd4e1c370f) (4,998.38 USDC), spending 5,000 USDC, that will be refunded in this VIP with funds from the Venus Treasury on BNB Chain.

#### Deployed contracts

- Mainnet vUSDC_Core: [0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a)
- Testnet vUSDC_Core: [0xA266EfCC7D1a8F1AAd093446E3C0115467ea8b9C](https://sepolia.explorer.zksync.io/address/0xA266EfCC7D1a8F1AAd093446E3C0115467ea8b9C)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/421)
- [Deployment to zkSync sepolia](https://sepolia.explorer.zksync.io/tx/0x2c6e155d736dd2a8d0a453a697853de95969e35341cb4a91bffb1fdaf85c9233#overview)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0xa60ebcb8664eb36fba3bc7211ecc82c2cd36cd9a87ee652a9d5cb46f25586d90) multisig transaction will be executed. Otherwise, it will be rejected.
`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };
  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("5000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip392;
