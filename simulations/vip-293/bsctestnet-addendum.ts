import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import vip293Addendum, {
  COMPTROLLER_ADDRESS,
  OLD_ankrBNB,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  RESILIENT_ORACLE,
  VTOKEN_BEACON,
  VTOKEN_IMP,
  ankrBNB,
  vankrBNB,
} from "../../vips/vip-293/bsctestnet-addendum";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";
import VTOKEN_BEACON_ABI from "./abi/vTokenBeacon.json";

forking(39580376, async () => {
  let resilientOracle: Contract;
  let vankrBNBContract: Contract;
  let proxyAdmin: Contract;
  let vTokenBeaconContract: Contract;
  let poolRegistry: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    vankrBNBContract = new ethers.Contract(vankrBNB, VTOKEN_ABI, ethers.provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    vTokenBeaconContract = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
    poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check ankrBNB underlying", async () => {
      const underlying = await vankrBNBContract.underlying();
      expect(underlying).to.be.equal(OLD_ankrBNB);
    });
  });

  testVip("VIP-293", await vip293Addendum(), {});

  describe("Post-VIP behavior", async () => {
    it("check ankrBNB price", async () => {
      const price = parseUnits("597.600929952665736426", "18");
      expect(await resilientOracle.getPrice(ankrBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vankrBNB)).to.be.equal(price);
    });

    it("check vankrBNB underlying", async () => {
      const underlying = await vankrBNBContract.underlying();
      expect(underlying).to.be.equal(ankrBNB);
    });

    it("pool registry should have original implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).to.equal(ORIGINAL_POOL_REGISTRY_IMP);
    });

    it("vTokenBeacon should have original implementation", async () => {
      expect(await vTokenBeaconContract.implementation()).to.equal(VTOKEN_IMP);
    });

    it("getVTokenForAsset should return vankrBNB address for ankrBNB and zero_address for old ankrBNB ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_ADDRESS, ankrBNB)).to.be.equal(vankrBNB);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_ADDRESS, OLD_ankrBNB)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });
  });
});
