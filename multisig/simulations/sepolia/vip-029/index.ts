import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { PTweETH, vPTweETH, vip029 } from "../../../proposals/sepolia/vip-029";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";

forking(5773190, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vPTweETHContract: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vPTweETHContract = await ethers.getContractAt(VTOKEN_ABI, vPTweETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(PTweETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip029());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(PTweETH)).to.be.closeTo(parseUnits("2990", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vPTweETH)).to.be.closeTo(
        parseUnits("2990", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 4 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(4);
    });

    it("should add vPTweETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, PTweETH);
      expect(registeredVToken).to.equal(vPTweETH);
    });

    it("check ownership", async () => {
      expect(await vPTweETHContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.79961879", 8);
      expect(await vPTweETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    });
  });
});
