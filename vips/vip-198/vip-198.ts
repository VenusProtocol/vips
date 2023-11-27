import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PLANET = "0xca6d678e74f553f0e59cccc03ae644a3c2c5ee7d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER = "0x0554d6079eBc222AD12405E52b264Bdb5B65D1cf";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const MAX_STALE_PERIOD = 60 * 25;

export const vip198 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-198 Add support for PLANET market in the DeFi pool",
    description: `#### Summary

If passed, this VIP will add a new market for [PLANET](https://bscscan.com/address/0xca6d678e74f553f0e59cccc03ae644a3c2c5ee7d) into the Isolated Lending DeFi pool.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-to-list-planet-on-venus/3866/2), the risk parameters for the new market are:

- Underlying token: [PLANET](https://bscscan.com/address/0xca6d678e74f553f0e59cccc03ae644a3c2c5ee7d)
- Borrow cap: 500,000,000 PLANET
- Supply cap: 1,000,000,000 PLANET
- Collateral factor: 0.2
- Liquidation threshold: 0.3
- Reserve factor: 0.25

Bootstrap liquidity: 174,983,000 PLANET - provided by the [Planet ReFi project](https://planetrefi.com/)

Interest rate curve for the new market:

- kink: 0.45
- base (yearly): 0.02
- multiplier (yearly): 0.2
- jump multiplier (yearly): 3

**Rewards**

- 3,000 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955), for 28 days, for borrowers and suppliers (50/50) in the new PLANET market

**Security and additional considerations**

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the DeFi pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

**Contracts on mainnet**

New market vPLANET_DeFi: [0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be](https://bscscan.com/address/0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be)

**Contracts on testnet**

New market vPLANET_DeFi: [0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1](https://testnet.bscscan.com/address/0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1)

**References**

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [Fork tests of main operations](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/102)
- [Forum proposal to add PLANET market to Venus](https://community.venus.io/t/proposal-to-list-planet-on-venus/3866/1)
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
        params: ["PLANET", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PLANET,
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
        target: VPLANET_DEFI,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [28800],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [PLANET, parseUnits("174983000", 18), NORMAL_TIMELOCK],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: PLANET,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("174983000", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPLANET_DEFI,
            parseUnits("0.2", 18),
            parseUnits("0.3", 18),
            parseUnits("174983000", 18),
            VTOKEN_RECEIVER,
            parseUnits("1000000000", 18),
            parseUnits("500000000", 18),
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("3000", 18), REWARD_DISTRIBUTOR],
      },
      {
        target: COMPTROLLER,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[VPLANET_DEFI], ["1860119047619047"], ["1860119047619047"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
