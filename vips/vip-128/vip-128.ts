import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const INITIAL_FUNDING = parseUnits("5.499943", 18);
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const VTOKEN_RECEIVER = "0x7d3217feb6f310f7e7b7c8ee130db59dcad1dd45";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BINANCE_ORACLE_NEW = "0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9";
const BINANCE_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const MAX_STALE_PERIOD = 60 * 25;

export const vip128 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-128 Add WBETH market to the Venus Core pool",
    description: `
#### Summary

As part ot the BETH token deprecation and rebranding to WBETH as previously addressed in [VIP-111](https://app.venus.io/governance/proposal/111), if passed this VIP will perform the following actions: 

* Add a new market in the Core pool for the token WBETH (wrapped Binance ETH).
* Upgrade the BinanceOracle contract to support the new market

#### Description

A new market for WBETH will be added to the Core pool. 

The risk parameters of the new market are:

* Collateral factor: 50%
* Supply cap: 300 WBETH
* Borrow cap: 200 WBETH
* Reserver factor: 20%
* XVS Distributions: 34.34/Day

These parameters will be monitored and adjusted if needed in the future.

Moreover, in order to support the new market, it was needed to upgrade the implementation of the BinanceOracle contract. This upgrade translates the wBETH symbol of the token to WBETH, as expected by the Binance Oracle system.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Add WBETH in a simulation environment**: we added the new market to the Core pool, and we verified everything works as expected
* **Deployment on testnet**: the same market for WBETH has been deployed to testnet, and used in the Venus Protocol testnet deployment
* **Security review**: Peckshield and Certik reviewed the change done in the BinanceOracle contract

5.499943 WBETH will be initially provided, as bootstrap liquidity for this market.This mitigates potential attacks on empty pools previously observed in other Lending protocols. The vTokens minted with this bootstrap liquidity are sent to Binance Simple Earn, the liquidity provider.

#### Deployed contracts on main net

* vWBETH (new market): [0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
* BinanceOracle (new implementation): [0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9](https://bscscan.com/address/0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9)

#### Fork tests (simulations)

* https://github.com/VenusProtocol/vips/pull/26 

#### References

* [Repository](https://github.com/VenusProtocol/venus-protocol)
* [WBETH token in BNB chain](https://bscscan.com/address/0xa2E3356610840701BDf5611a53974510Ae27E2e1)
* vWBETH (new market) on testnet: [0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b](https://testnet.bscscan.com/address/0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b)
* [Binance Introduces Wrapped Beacon ETH (WBETH) on ETH Staking](https://www.binance.com/en/support/announcement/binance-introduces-wrapped-beacon-eth-wbeth-on-eth-staking-a1197f34d832445db41654ad01f56b4d)
    `,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BINANCE_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_NEW],
      },

      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VWBETH],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("300", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("200", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VWBETH], ["596440972222220"], ["596440972222220"]],
      },

      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["WBETH", maxStalePeriod || MAX_STALE_PERIOD],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WBETH,
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
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VWBETH, parseUnits("0.5", 18)],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBETH, INITIAL_FUNDING, NORMAL_TIMELOCK],
      },

      {
        target: WBETH,
        signature: "approve(address,uint256)",
        params: [VWBETH, 0],
      },

      {
        target: WBETH,
        signature: "approve(address,uint256)",
        params: [VWBETH, INITIAL_FUNDING],
      },

      {
        target: VWBETH,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VWBETH,
        signature: "transfer(address,uint256)",
        params: [VTOKEN_RECEIVER, INITIAL_VTOKENS],
      },

      {
        target: VWBETH,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
