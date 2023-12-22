import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
const FDUSD_CHAINLINK_FEED = "0x390180e80058a8499930f0c13963ad3e0d86bfc9";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const VENUS_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const INITIAL_FUNDING = parseUnits("10000", 18);
const COMMUNITY_WALLET_FUNDING = parseUnits("10000", 18);
const INITIAL_VTOKENS = parseUnits("10000", 8);
const BORROW_CAP = parseUnits("4400000", 18);
const SUPPLY_CAP = parseUnits("5500000", 18);
const REWARDS_SUPPLY_SPEED = 173611111111111;
const REWARDS_BORROW_SPEED = 173611111111111;
const COLLATERAL_FACTOR = parseUnits("0.75", 18);
const RESERVES_BLOCK_DELTA = 28800;
const RESERVE_FACTOR = parseUnits("0.1", 18);
const DEVIATION_LOWER_BOUND = parseUnits("0.99", 18);
const DEVIATION_UPPER_BOUND = parseUnits("1.01", 18);
const MAX_STALE_PERIOD_CHAINLINK = 88200; // 24.5 hours max stale period
const MAX_STALE_PERIOD_BINANCE = 1500; // 25 minutes max stale period

export const vip222 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-222 Add support for FDUSD on Venus Core Pool",
    description: `#### Summary

If passed, this VIP will add a new market for the [FDUSD token](https://bscscan.com/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409) on Venus Core Pool. Moreover, it will transfer 10,000 USDT to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) to compensate for the [provision of the bootstrap liquidity for the market](https://bscscan.com/tx/0x9b3d1fa33e3d210d258f4138e599d7f1efa616aabe283adfe2b93ca2da923b85).

#### Description

Following [Chaos Labs recommendations](https://community.venus.io/t/support-fdusd-on-venus-core-pool/3982/2), the risk parameters for the new markets are:

- Underlying token: [FDUSD](https://bscscan.com/address/0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409)
- Borrow cap: 4,400,000 FDUSD
- Supply cap: 5,500,000 FDUSD
- Collateral factor: 75%
- Reserve factor: 10%

Bootstrap liquidity: 10,000 FDUSD - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

XVS Distributions:

- 5 XVS/day for suppliers
- 5 XVS/day for borrowers

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0
- multiplier (yearly): 6.875%
- jump multiplier (yearly): 250%

Oracle configuration:

- Main oracle: [Chainlink](https://data.chain.link/bsc/mainnet/stablecoins/fdusd-usd)
- Pivot oracle: [Binance oracle](https://oracle.binance.com/data-feeds/detail/bsc/FDUSD-USD)
- [Bounds](https://docs-v4.venus.io/technical-reference/reference-oracle/boundvalidator): [0.99, 1.01]

#### Security and additional considerations

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the core pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet FDUSD market (vFDUSD): [0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
- Testnet FDUSD market (vFDUSD): [0xF06e662a00796c122AaAE935EC4F0Be3F74f5636](https://testnet.bscscan.com/address/0xF06e662a00796c122AaAE935EC4F0Be3F74f5636)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/139)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x224ad2b0f15bf95fe6d9643727d81d772d74c2fa3e712fb4ff33e59db5fc7750)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this VIP",
    againstDescription: "I do not think that Venus Protocol should proceed with this VIP",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this VIP or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[FDUSD, FDUSD_CHAINLINK_FEED, maxStalePeriod || MAX_STALE_PERIOD_CHAINLINK]],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["FDUSD", maxStalePeriod || MAX_STALE_PERIOD_BINANCE],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[FDUSD, DEVIATION_UPPER_BOUND, DEVIATION_LOWER_BOUND]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            FDUSD,
            [CHAINLINK_ORACLE, BINANCE_ORACLE, "0x0000000000000000000000000000000000000000"],
            [true, true, false],
          ],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VFDUSD],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VFDUSD], [SUPPLY_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VFDUSD], [BORROW_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VFDUSD], [REWARDS_SUPPLY_SPEED], [REWARDS_BORROW_SPEED]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VFDUSD, COLLATERAL_FACTOR],
      },
      {
        target: VFDUSD,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: VFDUSD,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: VFDUSD,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [RESERVES_BLOCK_DELTA],
      },
      {
        target: VFDUSD,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },

      {
        target: VENUS_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [FDUSD, INITIAL_FUNDING, NORMAL_TIMELOCK],
      },

      {
        target: FDUSD,
        signature: "approve(address,uint256)",
        params: [VFDUSD, 0],
      },

      {
        target: FDUSD,
        signature: "approve(address,uint256)",
        params: [VFDUSD, INITIAL_FUNDING],
      },
      {
        target: VFDUSD,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VFDUSD,
        signature: "transfer(address,uint256)",
        params: [VENUS_TREASURY, INITIAL_VTOKENS],
      },

      {
        target: VENUS_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_WALLET_FUNDING, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
