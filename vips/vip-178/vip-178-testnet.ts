import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const agEUR = "0x63061de4A25f24279AAab80400040684F92Ee319";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_agEUR = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const vagEUR_StableCoins = "0x4E1D35166776825402d50AfE4286c500027211D1";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const REWARD_DISTRIBUTOR = "0x78d32FC46e5025c29e3BA03Fcf2840323351F26a";
const STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const ANGLE = "0xD1Bc731d188ACc3f52a6226B328a89056B0Ec71a";

export const vip178Testnet = () => {
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
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [agEUR, parseUnits("1.06", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            agEUR,
            [
              CHAINLINK_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },

      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [ANGLE, parseUnits(".032", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ANGLE,
            [
              CHAINLINK_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: agEUR,
        signature: "faucet(uint256)",
        params: [parseUnits("9000", 18)],
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
            vagEUR_StableCoins,
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
        target: ANGLE,
        signature: "faucet(uint256)",
        params: [parseUnits("17650", 18)],
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
        params: [[vagEUR_StableCoins], ["0"], ["87549603174603174"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
