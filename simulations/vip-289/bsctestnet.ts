import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, {
  BNBx,
  COMPTROLLER_ADDRESS,
  OLD_ankrBNB,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  RESILIENT_ORACLE,
  SlisBNB,
  StkBNB,
  VTOKEN_BEACON,
  VTOKEN_IMP,
  WBETH,
  ankrBNB,
} from "../../vips/vip-289/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";
import VTOKEN_BEACON_ABI from "./abi/vTokenBeacon.json";

const vankrBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";
const vBNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const vstkBNB = "0x75aa42c832a8911B77219DbeBABBB40040d16987";
const vslisBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";

forking(39546962, () => {
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
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("342.50005266", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("217", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("328.36", "18"));
    });

    it("check WBETH price", async () => {
      await expect(resilientOracle.getPrice(WBETH)).to.be.reverted;
    });

    it("check ankrBNB price", async () => {
      await expect(resilientOracle.getPrice(ankrBNB)).to.be.reverted;
    });

    it("check underlying", async () => {
      const underlying = await vankrBNBContract.underlying();
      expect(underlying).to.be.equal(OLD_ankrBNB);
    });
  });

  testVip("VIP-189", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = parseUnits("995.066590121060748618", "18");
      expect(await resilientOracle.getPrice(BNBx)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vBNBx)).to.be.equal(price);
    });

    it("check SlisBNB price", async () => {
      const price = parseUnits("2245.658509208987773191", "18");
      expect(await resilientOracle.getPrice(SlisBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vslisBNB)).to.be.equal(price);
    });

    it("check StkBNB price", async () => {
      const price = parseUnits("541.121692431358905295", "18");
      expect(await resilientOracle.getPrice(StkBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vstkBNB)).to.be.equal(price);
    });

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3171.1719262411480405", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = parseUnits("578.780838475245337708", "18");
      expect(await resilientOracle.getPrice(ankrBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vankrBNB)).to.be.equal(price);
    });

    it("check underlying", async () => {
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
