import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";

export const asBNBMarketSpec = {
  vToken: {
    address: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
    name: "Venus asBNB",
    symbol: "vasBNB",
    underlying: {
      address: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
      symbol: "asBNB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("0.14", 18), // 0.14 asBNB
    vTokensToBurn: parseUnits("0.14", 8), // 0.14 vasBNB
  },
  riskParameters: {
    supplyCap: parseUnits("2000", 18), // 2000 asBNB
    borrowCap: parseUnits("0", 18), // 0 asBNB
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vip520 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "vip-520 [BNB Chain] Enable BNB and FDUSD as Prime Markets on BNB Chain",
    description: `vip-520 [BNB Chain] Enable BNB and FDUSD as Prime Markets on BNB Chain

If passed, this VIP will enable [BNB](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) and [FDUSD](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba) markets on the Core pool (BNB Chain) as Prime Markets, following these community posts:

- [VRC: Enable BNB as a Prime Market on BNB Chain](https://community.venus.io/t/vrc-enable-bnb-as-a-prime-market-on-bnb-chain/5127) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xb262d9574010ffbe2981bdaf96f26d9cb6769b4f048fb654b4e041f1d1d5f222))
- [Proposal: Add FDUSD as a Prime Market to the Venus Core Pool on BNB Chain](https://community.venus.io/t/proposal-add-fdusd-as-a-prime-market-to-the-venus-core-pool-on-bnb-chain/4989) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xc330c51fa8db6d1485290eacfcb49a493d9ebdf3041dd87be6b5da54a51ae2a7))

Moreover, the [BTCB](https://bscscan.com/address/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B) and [ETH](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8) markets will be removed from the list of Prime Markets. The new reward distribution will be:

Complete analysis and details of these changes are available in the above publications.

**References**:

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/577)
- Execution on testnet ([BNB Chain](https://testnet.bscscan.com/tx/0x))`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add Market for asBNB
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [asBNBMarketSpec.vToken.address],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA_BSC],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [asBNBMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          asBNBMarketSpec.vToken.underlying.address,
          asBNBMarketSpec.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, 0],
      },
      // Burn initial supply of asBNB
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, asBNBMarketSpec.initialSupply.vTokensToBurn],
      },
      // Pause asBNB market
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[asBNBMarketSpec.vToken.address], [Actions.BORROW], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip520;
