import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bsctestnet;

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const CORE_POOL_ID = 0;

// Deployed in the preceding deploy step (see venus-protocol/deployments/bsctestnet).
export const MOCK_UXRP = "0xE4090cA6392c35D181164484476A6B09979364c9";
export const VUXRP = "0xDfc35DDed555F2B9E45846fb5E8aB81Fc7c02567";
export const RATE_MODEL = "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80";

export const marketSpecs = {
  vToken: {
    address: VUXRP,
    name: "Venus UXRP",
    symbol: "vUXRP",
    underlying: {
      address: MOCK_UXRP,
      decimals: 18,
      symbol: "UXRP",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: CHAINLINK_ORACLE,
    directPrice: parseUnits("2.5", 18), // $2.50 (mocked Chainlink direct price)
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.25", 18),
    supplyCap: parseUnits("236", 18),
    borrowCap: parseUnits("236", 18),
  },
  initialSupply: {
    amount: parseUnits("0.26", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.026", 8),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate);
export const vTokensRemaining = vTokensMinted.sub(marketSpecs.initialSupply.vTokensToBurn);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] List vUXRP market in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list a new market — Venus UXRP (vUXRP) — in the Venus Core Pool on BNB Chain testnet, with borrowing enabled at launch and UXRP usable as collateral.

#### Specification

- Asset: UXRP
- Pool: Core Pool
- Collateral Factor (max LTV): 60%
- Liquidation Threshold: 70%
- Liquidation Incentive: 10%
- Reserve Factor: 25%
- Supply Cap: 236 UXRP
- Borrow Cap: 236 UXRP
- Usable as collateral: Yes
- Borrowing: Enabled

Interest Rate Model (Jump):

- Base Rate: 0%
- Multiplier: 6.67%
- Jump Multiplier: 627%
- Kink: 75%

Oracle:

- Chainlink integration via Resilient Oracle (direct price of $2.50 on testnet)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────────────
      // Oracle — set the Chainlink direct price, then route the ResilientOracle to it.
      // ────────────────────────────────────────────────────────────────────────
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [marketSpecs.vToken.underlying.address, marketSpecs.oracle.directPrice],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            marketSpecs.vToken.underlying.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Add market and set caps (borrowing enabled — both caps set to 236 UXRP).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpecs.vToken.address],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpecs.vToken.address], [marketSpecs.riskParameters.supplyCap]],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpecs.vToken.address], [marketSpecs.riskParameters.borrowCap]],
      },
      // Enable borrowing for the market in the Core Pool (false by default after _supportMarket).
      {
        target: marketSpecs.vToken.comptroller,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [CORE_POOL_ID, marketSpecs.vToken.address, true],
      },

      // ────────────────────────────────────────────────────────────────────────
      // vToken configuration.
      // ────────────────────────────────────────────────────────────────────────
      {
        target: marketSpecs.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpecs.riskParameters.reserveFactor],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Risk parameters — collateral factor / liquidation threshold and incentive.
      // ────────────────────────────────────────────────────────────────────────
      {
        target: marketSpecs.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          marketSpecs.vToken.address,
          marketSpecs.riskParameters.collateralFactor,
          marketSpecs.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: marketSpecs.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [marketSpecs.vToken.address, marketSpecs.riskParameters.liquidationIncentive],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Initial liquidity — faucet the mock underlying, mint, burn a slice, send the rest to the receiver.
      // ────────────────────────────────────────────────────────────────────────
      {
        target: marketSpecs.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpecs.vToken.address, marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.address,
        signature: "mint(uint256)",
        params: [marketSpecs.initialSupply.amount],
      },
      {
        target: marketSpecs.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpecs.vToken.address, 0],
      },
      // Burn a slice of vTokens to prevent exchange-rate manipulation at market launch.
      {
        target: marketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, marketSpecs.initialSupply.vTokensToBurn],
      },
      // Transfer remaining vTokens to the receiver.
      {
        target: marketSpecs.vToken.address,
        signature: "transfer(address,uint256)",
        params: [marketSpecs.initialSupply.vTokenReceiver, vTokensRemaining],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
