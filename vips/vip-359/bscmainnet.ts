import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const NODEREAL = "0x3266be0289c57e09f18db689cfc34ed3efe995e8";
export const REDSTONE = "0xe6B210F1299a3B0D74BfA24D678A9dC1e2a27e34";
export const COMMUNITY = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const CERTIK_AMOUNT_USDT = parseUnits("17500", 18);
export const NODEREAL_AMOUNT_USDT = parseUnits("12150", 18);
export const COMMUNITY_AMOUNT_USDT = parseUnits("32600", 18);
export const REDSTONE_AMOUNT_USDC = parseUnits("24000", 18);
export const COMMUNITY_AMOUNT_ETH = parseUnits("2", 18);

export const vip359 = () => {
  const meta = {
    version: "v2",
    title: "VIP-359",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 17,500 USDT to Certik for the retainer program
- Transfer 12,150 USDT to NodeReal for the Meganode Enterprise service (Web3 RPC endpoint)
- Transfer 24,000 USDC and 2 ETH to RedStone Oracles for Price feed Oracles payment and maintenance
- Refund 2,600 USDT to Community Wallet for zkSync Era deployment GAS Refund
- Refund 25,000 USDT to Community Wallet for zkSync Era bootstrap liquidity
- Refund 5,000 USDT to Community Wallet for the bootstrap liquidity of the WETH market on the Liquid Staked ETH pool, on Arbitrum one

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of September 2024. Audits performed by Certik in August: [RiskFund upgrade](https://app.venus.io/#/governance/proposal/357) and [weETHAccountantOracle](https://app.venus.io/#/governance/proposal/355)
- Cost: 17,500 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**NodeReal - Meganode Enterprise**

- Provider: NodeReal ([https://nodereal.io](https://nodereal.io/))
- Service: Meganode Enterprise (https://nodereal.io/meganode) for 5 months (April 2024 - July 2024). The Web3 RPC endpoints provided by NodeReal are used by the [official Venus UI](https://app.venus.io/) and several backend services to collect data from the different blockchains (BNB Chain, Ethereum, Arbitrum one, opBNB).
- Cost: 12,150 USDT (2,430 USDT per month), to be sent to the BEP20 address 0x3266be0289c57e09f18db689cfc34ed3efe995e8

**RedStone Oracles**

- Provider: RedStone ([https://redstone.finance](https://redstone.finance/))
- Service: XVS/USD price feeds on Arbitrum one and zkSync Era
    - 1,000 USDC/month for the XVS/USD price feed on Arbitrum (12 months)
    - 1,000 USDC/month for the XVS/USD price feed on zkSync Era (12 months)
    - Cost: 24,000 USDC, to be sent to BEP20 address 0xe6B210F1299a3B0D74BfA24D678A9dC1e2a27e34
- Service: price feed updates of the XVS/USD feed on Ethereum
    - Cost: 2 ETH, to be sent to the Community Wallet (0xc444949e0054a23c44fc45789738bdf64aed2391). These funds will be later sent to the RedStone ERC20 Wallet: 0xE76A94749f1Debb6a8823CDdf44f1e51CC95600e

Community Wallet Refund

- Refund 2,600 USDT converted to [1 ETH](https://etherscan.io/tx/0x4404c412db817beb764b3904ca07fc3255ee5594cd5174a98d590c3eee18186e) to the Community Wallet that was used for GAS to deploy Venus new contracts to zkSync Era
- Refund 25,000 USDT to the Community Wallet swapped to different assets for the provision of Venus zkSync bootstrap liquidity to the [VTreasury on zkSync](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599)
- Refund 5,000 USDT to Community Wallet for the bootstrap liquidity of the WETH market on the Liquid Staked ETH pool, on Arbitrum one

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/369)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT_USDT, CERTIK],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, NODEREAL_AMOUNT_USDT, NODEREAL],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_AMOUNT_USDT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, REDSTONE_AMOUNT_USDC, REDSTONE],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, COMMUNITY_AMOUNT_ETH, COMMUNITY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip359;
