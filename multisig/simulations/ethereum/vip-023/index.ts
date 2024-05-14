import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { PTweETH, vPTweETH, vip023, COMPTROLLER } from "../../../proposals/ethereum/vip-023";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(19867748, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vweETHContract: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vweETHContract = await ethers.getContractAt(VTOKEN_ABI, vPTweETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(PTweETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip023());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(PTweETH)).to.be.closeTo(parseUnits("2664", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vPTweETH)).to.be.closeTo(
        parseUnits("2664", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 3 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(4);
    });

    it("should add vweETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, PTweETH);
      expect(registeredVToken).to.equal(vPTweETH);
    });

    it("check ownership", async () => {
      expect(await vweETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.79961879", 8);
      expect(await vweETHContract.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
    });
  });
});
