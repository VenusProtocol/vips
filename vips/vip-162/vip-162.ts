import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TWT = "0x4b0f1812e5df2a09796481ff14017e6005508003";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_TWT = "0x0848dB7cB495E7b9aDA1D4dC972b9A526D014D84";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTWT_DeFi = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const MAX_STALE_PERIOD = 60 * 25;

export const vip162 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-162 Add TWT market to DeFi Pool",
    description: `**Summary**

If passed, this VIP will add a new market for [TWT](https://bscscan.com/address/0x4b0f1812e5df2a09796481ff14017e6005508003) into the Isolated Lending DeFi pool.

**Description**

Related to [VIP-134](https://app.venus.io/governance/proposal/134) and [VIP-136](https://app.venus.io/governance/proposal/136), this VIP will add a market for TWT to the already existing DeFi pool.

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-14-2023/3700), the risk parameters for the new market are:

* Underlying token: [TWT](https://bscscan.com/address/0x4b0f1812e5df2a09796481ff14017e6005508003)
* Borrow cap: 500,000 TWT
* Supply cap: 1,000,000 TWT
* Collateral factor: 0.5
* Liquidation threshold: 0.6
* Reserve factor: 0.25

Bootstrap liquidity: 10,000 TWT - provided by the Trust Wallet Community.

Interest rate curve for the new market:

* kink: 0.5
* base (yearly): 0.02
* multiplier (yearly): 0.2
* jump multiplier (yearly): 3

**Security and additional considerations**

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

* **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the DeFi pool with the right parameters and the expected bootstrap liquidity
* **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

**Contracts on mainnet**

New market vTWT_DeFi: [0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F](https://bscscan.com/address/0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F)

**Contracts on testnet**

New market vankBNB_DeFi: [0x4C94e67d239aD585275Fdd3246Ab82c8a2668564](https://testnet.bscscan.com/address/0x4C94e67d239aD585275Fdd3246Ab82c8a2668564)

**References**

* [Repository](https://github.com/VenusProtocol/isolated-pools)
* [Fork tests of main operations](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork)
* [VIP simulation](https://github.com/VenusProtocol/vips/pull/62)
* [Forum proposal to add TWT market to Venus](https://community.venus.io/t/add-support-for-a-new-market-for-trust-wallet-twt-on-venus-core-pool/3691)
* [Community post about Venus V4, introducing Isolated Pools](https://community.venus.io/t/proposing-venus-v4)
* [Documentation](https://docs-v4.venus.io/whats-new/isolated-pools)
`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      // Tranfer From Treasury to community wallet
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("6000", 18), COMMUNITY_WALLET],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["TWT", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            TWT,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TWT, parseUnits("10000", 18), NORMAL_TIMELOCK],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VTWT_DeFi,
            parseUnits("0.5", 18),
            parseUnits("0.6", 18),
            parseUnits("10000", 18),
            VTOKEN_RECEIVER_TWT,
            parseUnits("1000000", 18),
            parseUnits("500000", 18),
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
