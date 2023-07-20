import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip145 } from "../../../vips/vip-145/vip-145";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const REWARDS_START_BLOCK = 29964632;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;

type VTokenSymbol =
  | "vHAY_Stablecoins"
  | "vBSW_DeFi"
  | "vFLOKI_GameFi"
  | "vRACA_GameFi"
  | "vBNBx_LiquidStakedBNB"
  | "vankrBNB_LiquidStakedBNB"
  | "vstkBNB_LiquidStakedBNB"
  | "vBTT_Tron"
  | "vTRX_Tron"
  | "vUSDD_Tron"
  | "vWIN_Tron";

const vTokens: { [key in VTokenSymbol]: string } = {
  vHAY_Stablecoins: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  vBSW_DeFi: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  vFLOKI_GameFi: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  vRACA_GameFi: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  vBNBx_LiquidStakedBNB: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
  vankrBNB_LiquidStakedBNB: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  vstkBNB_LiquidStakedBNB: "0xcc5D9e502574cda17215E70bC0B4546663785227",
  vBTT_Tron: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  vTRX_Tron: "0x836beb2cB723C498136e1119248436A645845F4E",
  vUSDD_Tron: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
  vWIN_Tron: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
};

type RewardsDistributorId =
  | "RewardsDistributor_BSW_DeFi"
  | "RewardsDistributor_FLOKI_GameFi"
  | "RewardsDistributor_HAY_Stablecoins"
  | "RewardsDistributor_RACA_GameFi"
  | "RewardsDistributor_BTT_Tron"
  | "RewardsDistributor_TRX_Tron"
  | "RewardsDistributor_USDD_Tron"
  | "RewardsDistributor_WIN_Tron"
  | "RewardsDistributor_ankrBNB_LiquidStakedBNB"
  | "RewardsDistributor_stkBNB_LiquidStakedBNB"
  | "RewardsDistributor_SD_LiquidStakedBNB";

const rewardsDistributors: { [key in RewardsDistributorId]: { address: string; vToken: string } } = {
  RewardsDistributor_BSW_DeFi: {
    address: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    vToken: vTokens.vBSW_DeFi,
  },
  RewardsDistributor_FLOKI_GameFi: {
    address: "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    vToken: vTokens.vFLOKI_GameFi,
  },
  RewardsDistributor_HAY_Stablecoins: {
    address: "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    vToken: vTokens.vHAY_Stablecoins,
  },
  RewardsDistributor_RACA_GameFi: {
    address: "0x2517A3bEe42EA8f628926849B04870260164b555",
    vToken: vTokens.vRACA_GameFi,
  },
  RewardsDistributor_BTT_Tron: {
    address: "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    vToken: vTokens.vBTT_Tron,
  },
  RewardsDistributor_TRX_Tron: {
    address: "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    vToken: vTokens.vTRX_Tron,
  },
  RewardsDistributor_USDD_Tron: {
    address: "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    vToken: vTokens.vUSDD_Tron,
  },
  RewardsDistributor_WIN_Tron: {
    address: "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    vToken: vTokens.vWIN_Tron,
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    address: "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    vToken: vTokens.vankrBNB_LiquidStakedBNB,
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    address: "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    vToken: vTokens.vstkBNB_LiquidStakedBNB,
  },
  RewardsDistributor_SD_LiquidStakedBNB: {
    address: "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    vToken: vTokens.vBNBx_LiquidStakedBNB,
  },
};

forking(30043000, () => {
  testVip("VIP-145", vip145());

  describe("Rewards distributors configuration", () => {
    const checkLastRewardingBlock = (id: RewardsDistributorId, lastRewardingBlock: number) => {
      describe(id, () => {
        let rewardsDistributor: Contract;
        let vTokenAddress: string;

        before(async () => {
          rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, rewardsDistributors[id].address);
          vTokenAddress = rewardsDistributors[id].vToken;
        });

        it(`should have lastRewardingBlock for supply side equal to "${lastRewardingBlock}"`, async () => {
          const supplyState = await rewardsDistributor.rewardTokenSupplyState(vTokenAddress);
          expect(supplyState.lastRewardingBlock).to.equal(lastRewardingBlock);
        });

        it(`should have lastRewardingBlock for borrow side equal to "${lastRewardingBlock}"`, async () => {
          const borrowState = await rewardsDistributor.rewardTokenBorrowState(vTokenAddress);
          expect(borrowState.lastRewardingBlock).to.equal(lastRewardingBlock);
        });
      });
    };

    for (const id of Object.keys(rewardsDistributors) as RewardsDistributorId[]) {
      if (id === "RewardsDistributor_HAY_Stablecoins") {
        checkLastRewardingBlock(id, REWARDS_END_BLOCK_28_DAYS);
      } else {
        checkLastRewardingBlock(id, REWARDS_END_BLOCK_30_DAYS);
      }
    }
  });

  describe("BNBx rewards distributor configuration", () => {
    let rewardsDistributor: Contract;
    const vBNBxAddress = rewardsDistributors.RewardsDistributor_SD_LiquidStakedBNB.vToken;

    before(async () => {
      rewardsDistributor = await ethers.getContractAt(
        REWARDS_DISTRIBUTOR_ABI,
        rewardsDistributors.RewardsDistributor_SD_LiquidStakedBNB.address,
      );
    });

    it("should set borrow-side SD rewards for BNBx_LiquidStakedBNB to 0", async () => {
      expect(await rewardsDistributor.rewardTokenBorrowSpeeds(vBNBxAddress)).to.equal(0);
    });

    // We check for 30 days even though the remaining time is lower
    it("should set supply-side SD rewards for BNBx_LiquidStakedBNB to 6400 SD / 30 days", async () => {
      const BLOCKS_PER_30_DAYS = 864000;
      const expectedRewardPerBlock = parseUnits("6400", 18).div(BLOCKS_PER_30_DAYS);
      expect(await rewardsDistributor.rewardTokenSupplySpeeds(vBNBxAddress)).to.equal(expectedRewardPerBlock);
    });
  });
});
