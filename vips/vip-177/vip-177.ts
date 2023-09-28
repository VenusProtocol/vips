import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const SnBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_SnBNB = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55";
const vSnBNB_LiquidStakedBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const REWARD_DISTRIBUTOR_SnBNB = "0x888E317606b4c590BBAD88653863e8B345702633";
const Liquid_Staked_BNB_Comptroller = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
const PROTOCOL_SHARE_RESERVE = "0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4";
const MAX_STALE_PERIOD = 60 * 25;

export const vip177 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-177 Add support for SnBNB market in the Liquid Staked BNB pool",
    description: `#### Summary

If passed, this VIP will add a new market for [SnBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) into the Isolated Lending Liquid Staked BNB pool.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-18-2023/3808), the risk parameters for the new market are:

- Underlying token: [SnBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B)
- Borrow cap: 100 SnBNB
- Supply cap: 1,000 SnBNB
- Collateral factor: 0.87
- Liquidation threshold: 0.9
- Reserve factor: 0.25

Bootstrap liquidity: 47 SnBNB - provided by the Helio Protocol Treasury.

Interest rate curve for the new market:

- kink: 0.5
- base (yearly): 0.02
- multiplier (yearly): 0.2
- jump multiplier (yearly): 3

**Security and additional considerations**

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked BNB pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

**Contracts on mainnet**

New market vSnBNB_LiquidStakedBNB: [0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A](https://bscscan.com/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A)

**Contracts on testnet**

New market vSnBNB_LiquidStakedBNB: [0xeffE7874C345aE877c1D893cd5160DDD359b24dA](https://testnet.bscscan.com/address/0xeffE7874C345aE877c1D893cd5160DDD359b24dA)

**References**

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [Fork tests of main operations](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/78)
- [Forum proposal to add SnBNB market to Venus](https://community.venus.io/t/isolated-lending-market-for-snbnb-on-venus/3716)
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
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SnBNB", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SnBNB,
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
        params: [SnBNB, parseUnits("47", 18), NORMAL_TIMELOCK],
      },
      {
        target: SnBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: SnBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("47", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vSnBNB_LiquidStakedBNB,
            parseUnits("0.87", 18),
            parseUnits("0.9", 18),
            parseUnits("47", 18),
            VTOKEN_RECEIVER_SnBNB,
            parseUnits("1000", 18),
            parseUnits("100", 18),
          ],
        ],
      },
      {
        target: REWARD_DISTRIBUTOR_SnBNB,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [HAY, parseUnits("3000", 18), NORMAL_TIMELOCK],
      },

      {
        target: HAY,
        signature: "transfer(address,uint256)",
        params: [REWARD_DISTRIBUTOR_SnBNB, parseUnits("3000", 18)],
      },
      {
        target: Liquid_Staked_BNB_Comptroller,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR_SnBNB],
      },
      {
        target: REWARD_DISTRIBUTOR_SnBNB,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[vSnBNB_LiquidStakedBNB], ["930059523809523"], ["930059523809523"]],
      },
      {
        target: vSnBNB_LiquidStakedBNB,
        signature: "setShortfallContract(address)",
        params: [SHORTFALL],
      },
      {
        target: vSnBNB_LiquidStakedBNB,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
