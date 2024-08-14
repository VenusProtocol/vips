import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip007, { POOL_REGISTRY, PRIME, PRIME_LIQUIDITY_PROVIDER } from "../../../proposals/zksyncsepolia/vip-008";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;
const XVS_BRIDGE = "0x760461ccB2508CAAa2ECe0c28af3a4707b853043";
const XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";

forking(3606272, async () => {
  before(async () => {
    await pretendExecutingVip(await vip007());
  });
  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvs: Contract;
    let xvsVault: Contract;
    const amount = parseUnits("1000", 18);

    before(async () => {
      xvs = await ethers.getContractAt(XVS_ABI, zksyncsepolia.XVS);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, zksyncsepolia.XVS_VAULT_PROXY);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      const xvsBridge = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));

      await xvs
        .connect(xvsBridge)
        .mint(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT, amount, { maxFeePerGas: "20000000000" });
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(POOL_REGISTRY);
    });

    it("should have correct owner", async () => {
      expect(await prime.owner()).to.be.equal(zksyncsepolia.GUARDIAN);
      expect(await primeLiquidityProvider.owner()).to.be.equal(zksyncsepolia.GUARDIAN);
    });

    it("stake XVS", async () => {
      const genericUser = await initMainnetUser(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("2"));
      let stakedAt = await prime.stakedAt(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);
      await xvs.connect(genericUser).approve(zksyncsepolia.XVS_VAULT_PROXY, amount, { maxFeePerGas: "20000000000" });
      await xvsVault.connect(genericUser).deposit(zksyncsepolia.XVS, 0, amount, { maxFeePerGas: "20000000000" });
      await expect(prime.connect(genericUser).claim({ maxFeePerGas: "20000000000" })).to.be.reverted;
      stakedAt = await prime.stakedAt(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    describe("generic tests", async () => {
      before(async () => {
        const xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));

        await xvs.connect(xvsMinter).mint(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("10"), {
          maxFeePerGas: "20000000000",
        });
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"), { maxFeePerGas: "20000000000" });
      });

      checkXVSVault();
    });
  });
});
