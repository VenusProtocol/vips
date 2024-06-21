import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip140 } from "../../../vips/vip-140/vip-140";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

type PoolId = "Stablecoins" | "DeFi" | "GameFi" | "LiquidStakedBNB" | "Tron";

const pools: { [key in PoolId]: string } = {
  Stablecoins: "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571",
  DeFi: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
  GameFi: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
  LiquidStakedBNB: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
  Tron: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
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
  HAY: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
  USDD: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
  BSW: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  RACA: "0x12BB890508c125661E03b09EC06E404bc9289040",
  FLOKI: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
  BNBx: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
  ankrBNB: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
  stkBNB: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
  BTT: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
  WIN: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
  TRX: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  SD: "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8",
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
    address: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    token: tokens.BSW,
    vToken: vTokens.vBSW_DeFi,
    borrowSpeed: parseUnits("28950", 18).div(2).div(864000),
    supplySpeed: parseUnits("28950", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("48250", 18),
  },
  RewardsDistributor_FLOKI_GameFi: {
    pool: pools.GameFi,
    address: "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    token: tokens.FLOKI,
    vToken: vTokens.vFLOKI_GameFi,
    borrowSpeed: parseUnits("397968025.47", 9).div(2).div(864000), // note 9 decimals on mainnet
    supplySpeed: parseUnits("397968025.47", 9).div(2).div(864000), // note 9 decimals on mainnet
    totalRewardsToDistribute: parseUnits("397968025.47", 9), // note 9 decimals on mainnet
  },
  RewardsDistributor_HAY_Stablecoins: {
    pool: pools.Stablecoins,
    address: "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    token: tokens.HAY,
    vToken: vTokens.vHAY_Stablecoins,
    borrowSpeed: parseUnits("3000", 18).div(2).div(806400), // 28 days
    supplySpeed: parseUnits("3000", 18).div(2).div(806400), // 28 days
    totalRewardsToDistribute: parseUnits("3000", 18),
  },
  RewardsDistributor_RACA_GameFi: {
    pool: pools.GameFi,
    address: "0x2517A3bEe42EA8f628926849B04870260164b555",
    token: tokens.RACA,
    vToken: vTokens.vRACA_GameFi,
    borrowSpeed: parseUnits("10500000", 18).div(2).div(864000),
    supplySpeed: parseUnits("10500000", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("10500000", 18),
  },
  RewardsDistributor_BTT_Tron: {
    pool: pools.Tron,
    address: "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    token: tokens.BTT,
    vToken: vTokens.vBTT_Tron,
    borrowSpeed: parseUnits("34506556246", 18).div(2).div(864000),
    supplySpeed: parseUnits("34506556246", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("34506556246", 18),
  },
  RewardsDistributor_TRX_Tron: {
    pool: pools.Tron,
    address: "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    token: tokens.TRX,
    vToken: vTokens.vTRX_Tron,
    borrowSpeed: parseUnits("78557", 6).div(2).div(864000), // note 6 decimals
    supplySpeed: parseUnits("78557", 6).div(2).div(864000), // note 6 decimals
    totalRewardsToDistribute: parseUnits("78557", 6), // note 6 decimals
  },
  RewardsDistributor_USDD_Tron: {
    pool: pools.Tron,
    address: "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    token: tokens.USDD,
    vToken: vTokens.vUSDD_Tron,
    borrowSpeed: parseUnits("25000", 18).div(2).div(864000),
    supplySpeed: parseUnits("25000", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("25000", 18),
  },
  RewardsDistributor_WIN_Tron: {
    pool: pools.Tron,
    address: "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    token: tokens.WIN,
    vToken: vTokens.vWIN_Tron,
    borrowSpeed: parseUnits("42863267", 18).div(2).div(864000),
    supplySpeed: parseUnits("42863267", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("42863267", 18),
  },
  RewardsDistributor_ankrBNB_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    token: tokens.ankrBNB,
    vToken: vTokens.vankrBNB_LiquidStakedBNB,
    borrowSpeed: parseUnits("46", 18).div(2).div(864000),
    supplySpeed: parseUnits("46", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("46", 18),
  },
  RewardsDistributor_stkBNB_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    token: tokens.stkBNB,
    vToken: vTokens.vstkBNB_LiquidStakedBNB,
    borrowSpeed: parseUnits("1.3", 18).div(864000),
    supplySpeed: parseUnits("4", 18).div(864000),
    totalRewardsToDistribute: parseUnits("5.3", 18),
  },
  RewardsDistributor_ST_LiquidStakedBNB: {
    pool: pools.LiquidStakedBNB,
    address: "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    token: tokens.SD,
    vToken: vTokens.vBNBx_LiquidStakedBNB,
    borrowSpeed: parseUnits("6400", 18).div(2).div(864000),
    supplySpeed: parseUnits("6400", 18).div(2).div(864000),
    totalRewardsToDistribute: parseUnits("6400", 18),
  },
};

forking(29871800, async () => {
  testVip("VIP-140", await vip140());

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
