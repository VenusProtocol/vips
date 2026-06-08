import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const { RESILIENT_ORACLE } = NETWORK_ADDRESSES.bsctestnet;
export const ATLAS_ORACLE = "0x7F00af2f30a55e79311392C98fBBfA629D19b3A5";

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const CORE_POOL_ID = 0;

// ACM permissions to grant on the newly deployed Atlas Oracle, to every governance timelock.
export const ATLAS_ORACLE_PERMISSIONS = ["setDirectPrice(address,uint256)", "setTokenConfig(TokenConfig)"];
export const TIMELOCKS = [bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK, bsctestnet.CRITICAL_TIMELOCK];

export type MarketSpec = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: { address: string; symbol: string; decimals: number };
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
    isLegacyPool: boolean;
  };
  rateModel: string;
  interestRateModel: {
    model: "jump";
    baseRatePerYear: string;
    multiplierPerYear: string;
    jumpMultiplierPerYear: string;
    kink: string;
  };
  oracle: {
    address: string;
    // Testnet uses a direct mocked price.
    directPrice: BigNumber;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    liquidationIncentive: BigNumber;
    reserveFactor: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
    vTokensToBurn: BigNumber;
  };
};

// Market 1 — T4B
export const MARKET_1: MarketSpec = {
  vToken: {
    address: "0x4a45FBAf2A736bdF025DEd1D0Af3dF80070EDac0",
    name: "Venus T4B",
    symbol: "vT4B",
    underlying: {
      address: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A", // MockT4B
      symbol: "T4B",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80",
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: ATLAS_ORACLE,
    directPrice: parseUnits("400", 18), // $400
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("236", 18),
    borrowCap: parseUnits("236", 18),
  },
  initialSupply: {
    amount: parseUnits("0.26", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.026", 8),
  },
};

// Market 2 — N4B
export const MARKET_2: MarketSpec = {
  vToken: {
    address: "0x7397B6bcFA9332Cc8791c886F339B4D114651719",
    name: "Venus N4B",
    symbol: "vN4B",
    underlying: {
      address: "0x16691f500541ca35bd63DD878B6D78728C9518AE", // MockN4B
      symbol: "N4B",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80",
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: ATLAS_ORACLE,
    directPrice: parseUnits("200", 18), // $200
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("450", 18),
    borrowCap: parseUnits("450", 18),
  },
  initialSupply: {
    amount: parseUnits("0.5", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.05", 8),
  },
};

export const MARKETS: MarketSpec[] = [MARKET_1, MARKET_2];

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensRemaining = (m: MarketSpec) =>
  convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate).sub(m.initialSupply.vTokensToBurn);

export const vip669 = () => {
  const meta = {
    version: "v2",
    title: "VIP-669 [BNB Chain Testnet] List new markets in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list two new markets in the Venus Core Pool on BNB Chain testnet.

The assets, risk parameters and oracle configuration will be detailed ahead of execution.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Grant every governance timelock permission to configure the newly deployed Atlas Oracle.
      ...ATLAS_ORACLE_PERMISSIONS.flatMap(signature =>
        TIMELOCKS.map(timelock => ({
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [ATLAS_ORACLE, signature, timelock],
        })),
      ),
      ...MARKETS.flatMap(m => [
        // Oracle configuration — set a direct mocked price on the Atlas Oracle, then route the ResilientOracle to it.
        {
          target: m.oracle.address,
          signature: "setDirectPrice(address,uint256)",
          params: [m.vToken.underlying.address, m.oracle.directPrice],
        },
        {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3],bool))",
          params: [
            [
              m.vToken.underlying.address,
              [m.oracle.address, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        },

        // Add market
        {
          target: m.vToken.comptroller,
          signature: "_supportMarket(address)",
          params: [m.vToken.address],
        },
        {
          target: m.vToken.comptroller,
          signature: "_setMarketSupplyCaps(address[],uint256[])",
          params: [[m.vToken.address], [m.riskParameters.supplyCap]],
        },
        {
          target: m.vToken.comptroller,
          signature: "_setMarketBorrowCaps(address[],uint256[])",
          params: [[m.vToken.address], [m.riskParameters.borrowCap]],
        },
        // Enable borrowing for the market
        {
          target: m.vToken.comptroller,
          signature: "setIsBorrowAllowed(uint96,address,bool)",
          params: [CORE_POOL_ID, m.vToken.address, true],
        },
        {
          target: m.vToken.address,
          signature: "setAccessControlManager(address)",
          params: [bsctestnet.ACCESS_CONTROL_MANAGER],
        },
        {
          target: m.vToken.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },
        {
          target: m.vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [REDUCE_RESERVES_BLOCK_DELTA],
        },
        {
          target: m.vToken.address,
          signature: "_setReserveFactor(uint256)",
          params: [m.riskParameters.reserveFactor],
        },
        {
          target: m.vToken.comptroller,
          signature: "setCollateralFactor(address,uint256,uint256)",
          params: [m.vToken.address, m.riskParameters.collateralFactor, m.riskParameters.liquidationThreshold],
        },
        {
          target: m.vToken.comptroller,
          signature: "setLiquidationIncentive(address,uint256)",
          params: [m.vToken.address, m.riskParameters.liquidationIncentive],
        },

        // Initial liquidity: faucet the mock underlying, mint, burn a slice, send the rest to the receiver.
        {
          target: m.vToken.underlying.address,
          signature: "faucet(uint256)",
          params: [m.initialSupply.amount],
        },
        {
          target: m.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.address, m.initialSupply.amount],
        },
        {
          target: m.vToken.address,
          signature: "mint(uint256)",
          params: [m.initialSupply.amount],
        },
        {
          target: m.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.address, 0],
        },
        // Burn a slice of vTokens
        {
          target: m.vToken.address,
          signature: "transfer(address,uint256)",
          params: [ethers.constants.AddressZero, m.initialSupply.vTokensToBurn],
        },
        // Transfer remaining vTokens to the receiver.
        {
          target: m.vToken.address,
          signature: "transfer(address,uint256)",
          params: [m.initialSupply.vTokenReceiver, vTokensRemaining(m)],
        },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip669;
