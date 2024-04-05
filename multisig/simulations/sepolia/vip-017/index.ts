import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip017, weETH, vweETH } from "../../../proposals/sepolia/vip-017";
import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import { parseUnits } from "ethers/lib/utils";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { sepolia } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";

interface VTokenState {
  name: string;
  symbol: string;
  decimals: number;
  underlying: string;
  exchangeRate: BigNumberish;
  comptroller: string;
}

forking(5633105, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vweETHContract: Contract
  let comptroller: Contract
 
  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vweETHContract = await ethers.getContractAt(VTOKEN_ABI, vweETH)
    comptroller  = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETH)).to.be.reverted
    })
  })

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip017());
    })

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETH)).to.be.closeTo(parseUnits("3400", 18), parseUnits("10", 18))
    })

    it("should have 3 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(3);
    });

    it("should add vweETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, weETH);
      expect(registeredVToken).to.equal(vweETH);
    })
  })
});
