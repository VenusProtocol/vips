import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PLANET = "0x52b4E1A2ba407813F829B4b3943A1e57768669A9";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER = "0x0554d6079eBc222AD12405E52b264Bdb5B65D1cf";
const VPLANET_DEFI = "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
export const vip197 = () => {
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
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [PLANET, parseUnits("0.00005117", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PLANET,
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
        target: VPLANET_DEFI,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [100],
      },
      {
        target: PLANET,
        signature: "faucet(uint256)",
        params: [parseUnits("174983000", 18)],
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
        target: USDT,
        signature: "allocateTo(address,uint256)",
        params: [REWARD_DISTRIBUTOR, parseUnits("3000", 6)],
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
        params: [[VPLANET_DEFI], ["1860"], ["1860"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
