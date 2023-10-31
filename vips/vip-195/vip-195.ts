import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const INITIAL_FUNDING = parseUnits("2454.88864000100000002", 18);
const INITIAL_VTOKENS = parseUnits("2454.8886400", 8);
const MAX_STALE_PERIOD = 60 * 25;

export const vip195 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-195 Add support for UNI on Venus Core Pool",
    description: `#### Summary

If passed, this VIP will add a new market for the [UNI token](https://bscscan.com/address/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1) on Venus Core Pool.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-add-support-for-mkr-and-uni-on-venus-core-pool/3847), the risk parameters for the new markets are:

- Underlying token: [UNI](https://bscscan.com/address/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1)
- Borrow cap: 30,000 UNI
- Supply cap: 50,000 UNI
- Collateral factor: 55%
- Reserve factor: 25%

Bootstrap liquidity: 2454.88 UNI - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Interest rate curve for the new market:

- kink: 50%
- base (yearly): 0
- multiplier (yearly): 20%
- jump multiplier (yearly): 300%

**Security and additional considerations**

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the core pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

**Deployed contracts:**

- **Mainnet UNI market (vUNI): [0x27FF564707786720C71A2e5c1490A63266683612](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)**
- Testnet UNI market (vUNI): ****[0x171B468b52d7027F12cEF90cd065d6776a25E24e](https://testnet.bscscan.com/address/0x171B468b52d7027F12cEF90cd065d6776a25E24e)

**References**

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/97)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x33d1c69dea454c5b0325161a249aef76510d2132edcde547a3cbaf086b6f62a9)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VUNI],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("50000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("30000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VUNI], ["81250000000000"], ["81250000000000"]],
      },

      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[UNI, "0xb57f259E7C24e56a1dA00F66b55A5640d9f9E7e4", maxStalePeriod || MAX_STALE_PERIOD]],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            UNI,
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
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VUNI, parseUnits("0.55", 18)],
      },

      {
        target: VUNI,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },

      // Permission will be removed once VIP 192 will be executed
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VUNI, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      },

      // Permission will be removed once VIP 192 will be executed
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VUNI, "_setReserveFactor(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: VUNI,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: VUNI,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [28800],
      },
      {
        target: VUNI,
        signature: "_setReserveFactor(uint256)",
        params: ["250000000000000000"],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [UNI, INITIAL_FUNDING, NORMAL_TIMELOCK],
      },

      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [VUNI, 0],
      },

      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [VUNI, INITIAL_FUNDING],
      },

      {
        target: VUNI,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VUNI,
        signature: "transfer(address,uint256)",
        params: [VTREASURY, INITIAL_VTOKENS],
      },

      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("10000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
