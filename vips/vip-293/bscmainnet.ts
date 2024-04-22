import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const BNBxOracle = "0x46F8f9e4cb04ec2Ca4a75A6a4915b823b98A0aA1";
export const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
export const SlisBNBOracle = "0xfE54895445eD2575Bf5386B90FFB098cBC5CA29A";
export const SlisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const StkBNBOracle = "0xdBAFD16c5eA8C29D1e94a5c26b31bFAC94331Ac6";
export const StkBNB = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";
export const WBETHOracle = "0x739db790c656E54590957Ed4d6B94665bCcb3456";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const ankrBNB = "0x52f24a5e03aee338da5fd9df68d2b6fae1178827";
export const ankrBNBOracle = "0xb0FCf0d45C15235D4ebC30d3c01d7d0D72Fd44AB";
export const vstkBNB_LiquidStakedBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const vslisBNB_LiquidStakedBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const vWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";
export const vBNBx_LiquidStakedBNB = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
export const vankrBNB_LiquidStakedBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
export const LST_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";

export const WBNB_SUPPLY = parseUnits("15000", 18);
export const SLISBNB_SUPPLY = parseUnits("3000", 18);
export const BNBX_SUPPLY = parseUnits("3000", 18);
export const ANKRBNB_SUPPLY = parseUnits("2000", 18);
export const STKBNB_SUPPLY = parseUnits("2500", 18);

export const WBNB_BORROW = parseUnits("12000", 18);
export const SLISBNB_BORROW = parseUnits("300", 18);
export const BNBX_BORROW = parseUnits("300", 18);
export const ANKRBNB_BORROW = parseUnits("200", 18);
export const STKBNB_BORROW = parseUnits("250", 18);

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

const vip293 = () => {
  const meta = {
    version: "v2",
    title: "VIP-293 New oracles for LST on BNB Chain and re-enable stkBNB and slisBNB markets",
    description: `#### Summary

If passed, following the [Chaos labs recommendations](https://community.venus.io/t/lst-isolated-pool-oracle-incident/3961/3), and the approach exposed in the community post “[Two-Step Oracle Method for Accurate LST Pricing](https://community.venus.io/t/two-step-oracle-method-for-accurate-lst-pricing/4094)”, this VIP configures new oracles for the tokens [ankrBNB](https://bscscan.com/address/0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827), [BNBx](https://bscscan.com/address/0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275), [slisBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) and [stkBNB](https://bscscan.com/address/0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16), using on-chain information, combined with the [USD price for BNB provided by Chainlink](https://bscscan.com/address/0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE), to derive the token prices.

Moreover, this VIP would resume borrowing and supplying on the following markets: [slisBNB](https://bscscan.com/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A), [stkBNB](https://bscscan.com/address/0xcc5D9e502574cda17215E70bC0B4546663785227). These markets were paused [on December 10th, 2023](https://bscscan.com/tx/0xc861b0aa2b499ed74c8c57c17d8ef54c691ca61b23a74596d28ba118d3ce6c27), related to the [LST Isolated Pool Oracle Incident](https://community.venus.io/t/lst-isolated-pool-oracle-incident/3961).

#### Description

This new set of oracles should reduce the potential surface attack on the affected Venus markets, removing the dependency on the liquidity of the Liquid Staked Tokens on the secondary markets to calculate the USD price.

Every new oracle converts first from the specific Liquid Staked Token to BNB, using on-chain information, and then from BNB to USD using Chainlink information.

- AnkrBNBOracle. It returns the USD price of the [ankrBNB](https://bscscan.com/address/0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827) token, converting on-chain from ankrBNB to BNB using the exchange rate from the ankrBNB contract.
- BNBxOracle. It returns the USD price of the [BNBx](https://bscscan.com/address/0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275) token, converting on-chain from BNBx to BNB using the exchange rate from the [stake manager](https://bscscan.com/address/0x7276241a669489e4bbb76f63d2a43bfe63080f2f) contract.
- SlisBNBOracle. It returns the USD price of the [slisBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) token, converting on-chain from slisBNB to BNB using the exchange rate from the [stake manager](https://bscscan.com/address/0x1adB950d8bB3dA4bE104211D5AB038628e477fE6) contract.
- StkBNBOracle. It returns the USD price of the [stkBNB](https://bscscan.com/address/0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16) token, converting on-chain from stkBNB to BNB using the exchange rate from the [stake pool](https://bscscan.com/address/0xC228CefDF841dEfDbD5B3a18dFD414cC0dbfa0D8) contract.

Every new oracle follows the Compound convention regarding the number of decimals of the returned value (36 - decimals(underlying token)).

Regarding the resumed markets (slisBNB and stkBNB), the following actions will be enabled: borrow, supply, enter market (enable the market to be used as collateral).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Quantstamp](https://quantstamp.com/), [Certik](https://www.certik.com/) and [Fairyproof](https://fairyproof.com/) have audited the new oracles for the Liquid Staked Tokens set in this VIP.
- **VIP execution simulation**: in a simulation environment, validating the new oracles are properly configured.
- **Deployment on testnet**: the same oracles have been deployed to BNB testnet, and used in the Venus Protocol testnet deployment

#### Audits

- [Quantstamp audit report](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf) (2024/April/12)
- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) (2024/April/12)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) (2024/March/28)

#### Contracts on mainnet

- [AnkrBNBOracle](https://bscscan.com/address/0xb0FCf0d45C15235D4ebC30d3c01d7d0D72Fd44AB)
- [BNBxOracle](https://bscscan.com/address/0x46F8f9e4cb04ec2Ca4a75A6a4915b823b98A0aA1)
- [SlisBNBOracle](https://bscscan.com/address/0xfE54895445eD2575Bf5386B90FFB098cBC5CA29A)
- [StkBNBOracle](https://bscscan.com/address/0xdBAFD16c5eA8C29D1e94a5c26b31bFAC94331Ac6)

#### Contracts on testnet

- [AnkrBNBOracle](https://testnet.bscscan.com/address/0x00ea3D7Abe2f04004Ce71f9ef5C04F5f8Dce2f55)
- [BNBxOracle](https://testnet.bscscan.com/address/0x24f6E7f40E3d8782E0c50d749625b6412437Af18)
- [SlisBNBOracle](https://testnet.bscscan.com/address/0x57e9230b8e57561e0Be71075A0BAC1B6e6a3369E)
- [StkBNBOracle](https://testnet.bscscan.com/address/0x78c1248c07c3724fe7D6FbD0e8D9859eF206B6d0)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/263)
- [Documentation about Correlated token oracles](https://docs-v4.venus.io/risk/resilient-price-oracle#correlated-token-oracles)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNBx,
            [BNBxOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SlisBNB,
            [SlisBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            StkBNB,
            [StkBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ankrBNB,
            [ankrBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: LST_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [vslisBNB_LiquidStakedBNB, vstkBNB_LiquidStakedBNB],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          false,
        ],
      },
      {
        target: LST_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [
            vWBNB_LiquidStakedBNB,
            vslisBNB_LiquidStakedBNB,
            vBNBx_LiquidStakedBNB,
            vankrBNB_LiquidStakedBNB,
            vstkBNB_LiquidStakedBNB,
          ],
          [WBNB_SUPPLY, SLISBNB_SUPPLY, BNBX_SUPPLY, ANKRBNB_SUPPLY, STKBNB_SUPPLY],
        ],
      },
      {
        target: LST_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [
            vWBNB_LiquidStakedBNB,
            vslisBNB_LiquidStakedBNB,
            vBNBx_LiquidStakedBNB,
            vankrBNB_LiquidStakedBNB,
            vstkBNB_LiquidStakedBNB,
          ],
          [WBNB_BORROW, SLISBNB_BORROW, BNBX_BORROW, ANKRBNB_BORROW, STKBNB_BORROW],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip293;
