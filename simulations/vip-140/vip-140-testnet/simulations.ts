import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip140Testnet } from "../../../vips/vip-140/vip-140-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

type PoolId = "Stablecoins" | "DeFi" | "GameFi" | "LiquidStakedBNB" | "Tron";

const pools: { [key in PoolId]: string } = {
  Stablecoins: "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B",
  DeFi: "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD",
  GameFi: "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
  LiquidStakedBNB: "0x596B11acAACF03217287939f88d63b51d3771704",
  Tron: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
};

type TokenSymbol =
  | "HAY"
  | "USDD"
  | "BSW"
  | "RACA"
  | "FLOKI"
  | "ankrBNB"
  | "stkBNB"
  | "BTT"
  | "WIN"
  | "TRX"
  | "SD"
  | "BNBx";

const tokens: { [key in TokenSymbol]: string } = {
  HAY: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
  USDD: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
  BSW: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
  RACA: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
  FLOKI: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
  BNBx: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
  ankrBNB: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
  stkBNB: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
  BTT: "0xE98344A7c691B200EF47c9b8829110087D832C64",
  WIN: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
  TRX: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
  SD: "0xac7D6B77EBD1DB8C5a9f0896e5eB5d485CB677b3",
};

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

interface RewardsDistributorConfig {
  pool: string;
  address: string;
  token: string;
  vToken: string;
  borrowSpeed: BigNumberish;
  supplySpeed: BigNumberish;
  totalRewardsToDistribute: BigNumberish;
}

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
  | "RewardsDistributor_ST_LiquidStakedBNB";

const rewardsDistributors: { [key in RewardsDistributorId]: RewardsDistributorConfig } = {
  RewardsDistributor_BSW_DeFi: {
    pool: pools.DeFi,
    address: "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
    token: tokens.BSW,
    vToken: vTokens.vBSW_DeFi,
    borrowSpeed: parseUnits("28950", 18).div(2).div(864000),
    supplySpeed: parseUnits("28950", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("48250", 18),
  },
  RewardsDistributor_FLOKI_GameFi: {
    pool: pools.GameFi,
    address: "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
    token: tokens.FLOKI,
    vToken: vTokens.vFLOKI_GameFi,
    borrowSpeed: parseUnits("397968025.47", 18).div(2).div(864000), // note 18 decimals on testnet
    supplySpeed: parseUnits("397968025.47", 18).div(2).div(864000), // note 18 decimals on testnet
    totalRewardsToDistribute: parseUnits("397968025.47", 18), // note 18 decimals on testnet
  },
  RewardsDistributor_HAY_Stablecoins: {
    pool: pools.Stablecoins,
    address: "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
    token: tokens.HAY,
    vToken: vTokens.vHAY_Stablecoins,
    borrowSpeed: parseUnits("3000", 18).div(2).div(806400), // 28 days
    supplySpeed: parseUnits("3000", 18).div(2).div(806400), // 28 days
    totalRewardsToDistribute: parseUnits("3000", 18),
  },
  RewardsDistributor_RACA_GameFi: {
    pool: pools.GameFi,
    address: "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
    token: tokens.RACA,
    vToken: vTokens.vRACA_GameFi,
    borrowSpeed: parseUnits("10500000", 18).div(2).div(864000),
    supplySpeed: parseUnits("10500000", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("10500000", 18),
  },
  RewardsDistributor_BTT_Tron: {
    pool: pools.Tron,
    address: "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
    token: tokens.BTT,
    vToken: vTokens.vBTT_Tron,
    borrowSpeed: parseUnits("34506556246", 18).div(2).div(864000),
    supplySpeed: parseUnits("34506556246", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("34506556246", 18),
  },
  RewardsDistributor_TRX_Tron: {
    pool: pools.Tron,
    address: "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
    token: tokens.TRX,
    vToken: vTokens.vTRX_Tron,
    borrowSpeed: parseUnits("78557", 6).div(2).div(864000), // note 6 decimals
    supplySpeed: parseUnits("78557", 6).div(2).div(864000), // note 6 decimals
    totalRewardsToDistribute: parseUnits("78557", 6), // note 6 decimals
  },
  RewardsDistributor_USDD_Tron: {
    pool: pools.Tron,
    address: "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
    token: tokens.USDD,
    vToken: vTokens.vUSDD_Tron,
    borrowSpeed: parseUnits("25000", 18).div(2).div(864000),
    supplySpeed: parseUnits("25000", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("25000", 18),
  },
  RewardsDistributor_WIN_Tron: {
    pool: pools.Tron,
    address: "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
    token: tokens.WIN,
    vToken: vTokens.vWIN_Tron,
    borrowSpeed: parseUnits("42863267", 18).div(2).div(864000),
    supplySpeed: parseUnits("42863267", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("42863267", 18),
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    token: tokens.ankrBNB,
    vToken: vTokens.vankrBNB_LiquidStakedBNB,
    borrowSpeed: parseUnits("46", 18).div(2).div(864000),
    supplySpeed: parseUnits("46", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("46", 18),
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
    token: tokens.stkBNB,
    vToken: vTokens.vstkBNB_LiquidStakedBNB,
    borrowSpeed: parseUnits("1.3", 18).div(864000),
    supplySpeed: parseUnits("4", 18).div(864000),
    totalRewardsToDistribute: parseUnits("5.3", 18),
  },
  RewardsDistributor_ST_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
    token: tokens.SD,
    vToken: vTokens.vBNBx_LiquidStakedBNB,
    borrowSpeed: parseUnits("6400", 18).div(2).div(864000),
    supplySpeed: parseUnits("6400", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("6400", 18),
  },
};

forking(31463725, async () => {
  testVip("VIP-140", await vip140Testnet());

  describe("Rewards distributors configuration", () => {
    const checkRewardsDistributor = (id: RewardsDistributorId, reward: RewardsDistributorConfig) => {
      describe(id, () => {
        let rewardsDistributor: Contract;

        before(async () => {
          rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, reward.address);
        });

        it(`should have rewardToken = "${reward.token}"`, async () => {
          expect(await rewardsDistributor.rewardToken()).to.equal(reward.token);
        });

        it(`should have owner = Normal Timelock`, async () => {
          expect(await rewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
        });

        it(`should have borrowSpeed = ${reward.borrowSpeed.toString()}`, async () => {
          expect(await rewardsDistributor.rewardTokenBorrowSpeeds(reward.vToken)).to.equal(reward.borrowSpeed);
        });

        it(`should have supplySpeed = ${reward.supplySpeed.toString()}`, async () => {
          expect(await rewardsDistributor.rewardTokenSupplySpeeds(reward.vToken)).to.equal(reward.supplySpeed);
        });

        it(`should have balance = ${reward.totalRewardsToDistribute.toString()}`, async () => {
          const token = await ethers.getContractAt(ERC20_ABI, reward.token);
          expect(await token.balanceOf(rewardsDistributor.address)).to.equal(reward.totalRewardsToDistribute);
        });

        it(`should be registered in Comptroller`, async () => {
          const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, reward.pool);
          expect(await comptroller.getRewardDistributors()).to.contain(rewardsDistributor.address);
        });
      });
    };

    for (const [id, reward] of Object.entries(rewardsDistributors) as [
      RewardsDistributorId,
      RewardsDistributorConfig,
    ][]) {
      checkRewardsDistributor(id, reward);
    }
  });

  describe("Pools configuration", () => {
    it("should have 1 rewards distributor in Stablecoins pool", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.Stablecoins);
      expect(await comptroller.getRewardDistributors()).to.have.lengthOf(1);
    });

    it("should have 1 rewards distributor in DeFi pool", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.DeFi);
      expect(await comptroller.getRewardDistributors()).to.have.lengthOf(1);
    });

    it("should have 2 rewards distributors in GameFi pool", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.GameFi);
      expect(await comptroller.getRewardDistributors()).to.have.lengthOf(2);
    });

    it("should have 3 rewards distributors in LiquidStakedBNB pool", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.LiquidStakedBNB);
      expect(await comptroller.getRewardDistributors()).to.have.lengthOf(3);
    });

    it("should have 4 rewards distributors in Tron pool", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.Tron);
      expect(await comptroller.getRewardDistributors()).to.have.lengthOf(4);
    });
  });
});
