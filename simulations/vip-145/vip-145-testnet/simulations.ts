import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip145Testnet } from "../../../vips/vip-145/vip-145-testnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const REWARDS_START_BLOCK = 31465785;
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
  vHAY_Stablecoins: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
  vBSW_DeFi: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  vFLOKI_GameFi: "0xef470AbC365F88e4582D8027172a392C473A5B53",
  vRACA_GameFi: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  vBNBx_LiquidStakedBNB: "0x644A149853E5507AdF3e682218b8AC86cdD62951",
  vankrBNB_LiquidStakedBNB: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  vstkBNB_LiquidStakedBNB: "0x75aa42c832a8911B77219DbeBABBB40040d16987",
  vBTT_Tron: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  vTRX_Tron: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  vUSDD_Tron: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
  vWIN_Tron: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
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
    address: "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
    vToken: vTokens.vBSW_DeFi,
  },
  RewardsDistributor_FLOKI_GameFi: {
    address: "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
    vToken: vTokens.vFLOKI_GameFi,
  },
  RewardsDistributor_HAY_Stablecoins: {
    address: "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
    vToken: vTokens.vHAY_Stablecoins,
  },
  RewardsDistributor_RACA_GameFi: {
    address: "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
    vToken: vTokens.vRACA_GameFi,
  },
  RewardsDistributor_BTT_Tron: {
    address: "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
    vToken: vTokens.vBTT_Tron,
  },
  RewardsDistributor_TRX_Tron: {
    address: "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
    vToken: vTokens.vTRX_Tron,
  },
  RewardsDistributor_USDD_Tron: {
    address: "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
    vToken: vTokens.vUSDD_Tron,
  },
  RewardsDistributor_WIN_Tron: {
    address: "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
    vToken: vTokens.vWIN_Tron,
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    address: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    vToken: vTokens.vankrBNB_LiquidStakedBNB,
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    address: "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
    vToken: vTokens.vstkBNB_LiquidStakedBNB,
  },
  RewardsDistributor_SD_LiquidStakedBNB: {
    address: "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
    vToken: vTokens.vBNBx_LiquidStakedBNB,
  },
};

forking(31720611, () => {
  testVip("VIP-145", vip145Testnet());

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
