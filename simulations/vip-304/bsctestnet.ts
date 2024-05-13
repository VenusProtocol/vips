import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import vip304, {
  RESILIENT_ORACLE, 
  BABYDOGE, 
  BINANCE_ORACLE,
  TREASURY,
  VBABYDOGE,
  VUSDT,
  COMPTROLLER,
  REWARDS_DISTRIBUTOR,
  USDT,
  REWARDS_AMOUNT,
} from "../../vips/vip-304/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";
import { Contract } from "ethers";
import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
const { bsctestnet } = NETWORK_ADDRESSES;

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  vTokenReceiver: string;
}

const vBabyDoge_riskParameters: RiskParameters = {
  borrowCap: parseUnits("800000000000000", 9).toString(),
  supplyCap: parseUnits("1600000000000000", 9).toString(),
  collateralFactor: "0.3",
  liquidationThreshold: "0.4",
  reserveFactor: "0.25",
  initialSupply: parseUnits("27917365987868.178893572", 9).toString(),
  vTokenReceiver: TREASURY,
};

const vUSDT_riskParameters: RiskParameters = {
  borrowCap: parseUnits("900000", 6).toString(),
  supplyCap: parseUnits("1000000", 6).toString(),
  collateralFactor: "0.75",
  liquidationThreshold: "0.77",
  reserveFactor: "0.1",
  initialSupply: parseUnits("5000", 6).toString(),
  vTokenReceiver: TREASURY,
};

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const vBabyDoge_interestRateModel: InterestRateModelSpec = {
  vToken: "vBabyDoge_Meme",
  kink: "0.45",
  base: "0",
  multiplier: "0.2",
  jump: "3",
};

const vUSDT_interestRateModel: InterestRateModelSpec = {
  vToken: "vUSDT_Meme",
  kink: "0.8",
  base: "0",
  multiplier: "0.175",
  jump: "2.5",
};


forking(40208623, () => {
  const provider = ethers.provider;
  let oracle: Contract
  let poolRegistry: Contract
  let vBabyDoge: Contract
  let Vusdt: Contract
  let comptroller: Contract
  let babyDoge: Contract
  let rewardDistributor: Contract

  before(async () => {
    oracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, BINANCE_ORACLE)
    poolRegistry = new ethers.Contract(bsctestnet.POOL_REGISTRY, POOL_REGISTRY_ABI, provider)
    vBabyDoge = await ethers.getContractAt(VTOKEN_ABI, VBABYDOGE)
    Vusdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT)
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER)
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR)
    babyDoge = await ethers.getContractAt(ERC20_ABI, BABYDOGE)
  });

  describe("Pre-VIP state", () => {
    it("check price", async () => {
      await expect(oracle.getPrice(BABYDOGE)).to.be.reverted
    })
  });

  testVip("Add Meme Pool", vip304(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
    },
  });

  describe("Post-VIP state", () => {
    it("check price", async () => {
      const price = await oracle.getPrice(BABYDOGE);
      expect(price).to.be.eq(parseUnits("0.000000001785007649000000000", 27));
    })

    it("should have 2 markets in meme pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(2);
    });

    it("should add vBabyDoge to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, BABYDOGE);
      expect(registeredVToken).to.equal(vBabyDoge.address);
    });

    it("should add vUSDT to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, USDT);
      expect(registeredVToken).to.equal(Vusdt.address);
    })

    it("check vBabyDoge ownership", async () => {
      expect(await vBabyDoge.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("check vUSDT ownership", async () => {
      expect(await Vusdt.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("check vBabyDoge supply", async () => {
      const expectedSupply = parseUnits("27917365987868.17889357", 8);
      expect(await vBabyDoge.balanceOf(TREASURY)).to.equal(expectedSupply);
    });

    it("check vUSDT supply", async () => {
      const expectedSupply = parseUnits("5000", 8);
      expect(await Vusdt.balanceOf(TREASURY)).to.equal(expectedSupply);
    });

    it("check reward token", async () => {
      expect(await rewardDistributor.rewardToken()).to.equal(BABYDOGE);
    });

    it(`rewards distributor should have balance`, async () => {
      expect(await babyDoge.balanceOf(rewardDistributor.address)).to.gte(REWARDS_AMOUNT);
    });
  });
});
