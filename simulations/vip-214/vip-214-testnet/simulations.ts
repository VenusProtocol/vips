import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip214 } from "../../../vips/vip-214/vip-214-testnet";

import PRIME_ABI from "./abi/prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/primeLiquidityProvider.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import VAI_CONTROLLER_PROXY_ABI from "./abi/vaiControllerProxy.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const OLD_PRIME_IMPLEMENTATION = "0x72C9Bc4433C912ecd8184B3F7dda55Ee25761896"
const OLD_VAI_CONTROLLER_IMPLEMENTATION = "0x78CDd0D792691dfBe7006ABcc2dc863938466f4A";
const NEW_PRIME_IMPLEMENTATION = "0xFa32e28b54B489CB72cF4BF956600A0910CCDb81";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0x8B13b4c2c634731be34cbF1874dC0b36F86b9b48";
const NEW_PLP_IMPLEMENTATION = "0x29406DD113B5E90f56Fa7E1E1Ca148DB8B4E6E7F";
const OLD_PLP_IMPLEMENTATION = "0x98d73B2E246a3506686CBA62d2118D2127dfD20E";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

forking(35776436, () => {
  const provider = ethers.provider;
  let prime: ethers.Contract;
  let vaiController: ethers.Contract;
  let plp: ethers.Contract;
  let defaultProxyAdmin: ethers.Contract;
  let vaiControllerProxy: ethers.Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

    prime = new ethers.Contract(PRIME_PROXY, PRIME_ABI, timelock);
    vaiController = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, timelock);
    plp = new ethers.Contract(PLP_PROXY, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_PROXY_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("upgrade", async () => {
      let implementation = await defaultProxyAdmin.getProxyImplementation(PRIME_PROXY);
      expect(implementation).to.equal(OLD_PRIME_IMPLEMENTATION);

      implementation = await defaultProxyAdmin.getProxyImplementation(PLP_PROXY);
      expect(implementation).to.equal(OLD_PLP_IMPLEMENTATION);

      implementation = await vaiControllerProxy.vaiControllerImplementation();
      expect(implementation).to.equal(OLD_VAI_CONTROLLER_IMPLEMENTATION);
    });
  });

  testVip("vip214Testnet", vip214(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["NewPrime", "MintOnlyForPrimeHolder", "NewVAIBaseRate", "NewVAIMintCap"], [1, 1, 1, 1]);
      expectEvents(txResponse, [COMPTROLLER_ABI], ["NewVAIMintRate"], [1])
    },
  });

  describe("Post-VIP behavior", () => {
    it("upgrade", async () => {
      let implementation = await defaultProxyAdmin.getProxyImplementation(PRIME_PROXY);
      expect(implementation).to.equal(NEW_PRIME_IMPLEMENTATION);

      implementation = await defaultProxyAdmin.getProxyImplementation(PLP_PROXY);
      expect(implementation).to.equal(NEW_PLP_IMPLEMENTATION);

      implementation = await vaiControllerProxy.vaiControllerImplementation();
      expect(implementation).to.equal(NEW_VAI_CONTROLLER_IMPLEMENTATION);
    });
  });
});
