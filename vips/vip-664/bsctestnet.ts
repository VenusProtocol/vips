import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bsctestnet;

// Core pool id on the Comptroller (Diamond) — used by the pool-aware setters.
export const CORE_POOL_ID = 0;

// Freshly deployed on bsctestnet (see venus-protocol/deployments/bsctestnet).
export const MOCKUXRP = "0xc894528f3A6D9cE9e7A431280e5C510e6F932174";
export const vUXRP = "0xb78F1eC7dEBd9752CFCAe354c68775FE5af3bEAb";
export const RATE_MODEL = "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80"; // JumpRateModel: base 0%, mult 6.67%, kink 75%, jump 627%
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const UXRP_PRICE = parseUnits("2.5", 18);

export const UXRPMarketSpec = {
  vToken: {
    address: vUXRP,
    name: "Venus UXRP",
    symbol: "vUXRP",
    underlying: {
      address: MOCKUXRP,
      decimals: 18,
      symbol: "UXRP",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    kink: "0.75",
    jumpMultiplierPerYear: "6.27",
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
    amount: parseUnits("100", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("10", 8),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(UXRPMarketSpec.initialSupply.amount, UXRPMarketSpec.vToken.exchangeRate);
export const vTokensRemaining = vTokensMinted.sub(UXRPMarketSpec.initialSupply.vTokensToBurn);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain testnet] Add UXRP market to the Core pool",
    description: `#### Summary

This VIP lists UXRP in the Venus Core Pool on BNB Chain testnet as a borrowable collateral asset.

#### Details

If approved, UXRP will be listed in the Core Pool with the following parameters:

- Collateral Factor (max LTV): 60%
- Liquidation Threshold: 70%
- Liquidation Incentive: 10%
- Reserve Factor: 25%
- Supply Cap: 236 UXRP
- Borrow Cap: 236 UXRP
- Usable as collateral: Yes
- Borrowing: Enabled

Interest Rate Model (JumpRateModel):

- Base Rate: 0%
- Multiplier: 6.67%
- Kink: 75%
- Jump Multiplier: 627%

Oracle:

- Chainlink integration via the Resilient Oracle (UXRP priced at $2.50)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // Configure the oracle (Chainlink as the sole source via Resilient Oracle)
      // ──────────────────────────────────────────────────────────────────────
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [UXRPMarketSpec.vToken.underlying.address, UXRP_PRICE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            UXRPMarketSpec.vToken.underlying.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      // ──────────────────────────────────────────────────────────────────────
      // List the market and set caps
      // ──────────────────────────────────────────────────────────────────────
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [UXRPMarketSpec.vToken.address],
      },
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[UXRPMarketSpec.vToken.address], [UXRPMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[UXRPMarketSpec.vToken.address], [UXRPMarketSpec.riskParameters.borrowCap]],
      },
      // Enable borrowing for the market (isBorrowAllowed defaults to false on listing)
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [CORE_POOL_ID, UXRPMarketSpec.vToken.address, true],
      },

      // ──────────────────────────────────────────────────────────────────────
      // Configure the vToken
      // ──────────────────────────────────────────────────────────────────────
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [UXRPMarketSpec.riskParameters.reserveFactor],
      },

      // ──────────────────────────────────────────────────────────────────────
      // Risk parameters
      // ──────────────────────────────────────────────────────────────────────
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [
          UXRPMarketSpec.vToken.address,
          UXRPMarketSpec.riskParameters.collateralFactor,
          UXRPMarketSpec.riskParameters.liquidationThreshold,
        ],
      },
      {
        target: UXRPMarketSpec.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [UXRPMarketSpec.vToken.address, UXRPMarketSpec.riskParameters.liquidationIncentive],
      },

      // ──────────────────────────────────────────────────────────────────────
      // Seed initial liquidity (minted by the timelock, leftover sent to VTreasury)
      // ──────────────────────────────────────────────────────────────────────
      {
        target: MOCKUXRP,
        signature: "faucet(uint256)",
        params: [UXRPMarketSpec.initialSupply.amount],
      },
      {
        target: UXRPMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [UXRPMarketSpec.vToken.address, UXRPMarketSpec.initialSupply.amount],
      },
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "mint(uint256)",
        params: [UXRPMarketSpec.initialSupply.amount],
      },
      {
        target: UXRPMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [UXRPMarketSpec.vToken.address, 0],
      },
      // Burn a small amount of vTokens to prevent exchange rate manipulation at market launch.
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, UXRPMarketSpec.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to the receiver.
      {
        target: UXRPMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [UXRPMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
