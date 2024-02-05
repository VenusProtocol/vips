import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const agEUR = "0x12f31b73d812c6bb0d735a218c086d44d5fe5f89";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_agEUR = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const vagEUR_StableCoin = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const REWARD_DISTRIBUTOR = "0x177ED4625F57cEa2804EA3A396c8Ff78f314F1CA";
const ANGLE = "0x97B6897AAd7aBa3861c04C0e6388Fc02AF1F227f";
const STABLECOIN_COMPTROLLER = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const MAX_STALE_PERIOD_AGEUR = 60 * 100;
const MAX_STALE_PERIOD_ANGLE = 60 * 25;

export const vip178 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-178 Add support for agEUR market in the Stablecoins pool",
    description: `#### Summary

If passed, this VIP will add a new market for [agEUR](https://bscscan.com/address/0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89) into the Isolated Lending Stablecoins pool.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-28-2023/3720), the risk parameters for the new market are:

- Underlying token: [agEUR](https://bscscan.com/address/0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89)
- Borrow cap: 50,000 agEUR
- Supply cap: 100,000 agEUR
- Collateral factor: 0.75
- Liquidation threshold: 0.8
- Reserve factor: 0.1

Bootstrap liquidity: 9,000 agEUR - provided by the Venus Community.

Interest rate curve for the new market:

- kink: 0.5
- base (yearly): 0.02
- multiplier (yearly): 0.1
- jump multiplier (yearly): 2.5

**Rewards**

- 17,650 [ANGLE](https://bscscan.com/token/0x97B6897AAd7aBa3861c04C0e6388Fc02AF1F227f), for 7 days, only for borrowers in the new agEUR market

**Security and additional considerations**

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Stablecoins pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

**Contracts on mainnet**

New market vagEUR_Stablecoins: [0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F](https://bscscan.com/address/0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F)

**Contracts on testnet**

New market vagEUR_Stablecoins: [0x4E1D35166776825402d50AfE4286c500027211D1](https://testnet.bscscan.com/address/0x4E1D35166776825402d50AfE4286c500027211D1)

**References**

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [Fork tests of main operations](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/79)
- [Forum proposal to add agEUR market to Venus](https://community.venus.io/t/isolated-market-for-ageur-on-venus/3709)
- [Community post about Venus V4, introducing Isolated Pools](https://community.venus.io/t/proposing-venus-v4)
- [Documentation](https://docs-v4.venus.io/whats-new/isolated-pools)`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["agEUR", "AGEUR"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["AGEUR", maxStalePeriod || MAX_STALE_PERIOD_AGEUR],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            agEUR,
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
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["ANGLE", maxStalePeriod || MAX_STALE_PERIOD_ANGLE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ANGLE,
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
        params: [agEUR, parseUnits("9000", 18), NORMAL_TIMELOCK],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: agEUR,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("9000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vagEUR_StableCoin,
            parseUnits("0.75", 18),
            parseUnits("0.8", 18),
            parseUnits("9000", 18),
            VTOKEN_RECEIVER_agEUR,
            parseUnits("100000", 18),
            parseUnits("50000", 18),
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ANGLE, parseUnits("17650", 18), NORMAL_TIMELOCK],
      },

      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ANGLE,
        signature: "transfer(address,uint256)",
        params: [REWARD_DISTRIBUTOR, parseUnits("17650", 18)],
      },
      {
        target: STABLECOIN_COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[vagEUR_StableCoin], ["0"], ["87549603174603174"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
