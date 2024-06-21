import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVAIController } from "src/vip-framework/checks/checkVAIController";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import { vip225 } from "../../../vips/vip-225/vip-225-testnet";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import NEW_PRIME_ABI from "./abi/newPrime.json";
import OLD_PRIME_ABI from "./abi/oldPrime.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import VAI_CONTROLLER_PROXY_ABI from "./abi/vaiControllerProxy.json";

const PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const OLD_PRIME_IMPLEMENTATION = "0x72C9Bc4433C912ecd8184B3F7dda55Ee25761896";
const OLD_VAI_CONTROLLER_IMPLEMENTATION = "0x78CDd0D792691dfBe7006ABcc2dc863938466f4A";
const NEW_PRIME_IMPLEMENTATION = "0x1a0fd0e9FA06D1338deDfDDbB057542D8C96Fa33";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0xBfBCdA434f940CaEdE18b3634E106C5ED8d1DE5c";
const NEW_PLP_IMPLEMENTATION = "0x97656bCB9ca76A0b76D19e2b077fD23b086D1bA0";
const OLD_PLP_IMPLEMENTATION = "0x98d73B2E246a3506686CBA62d2118D2127dfD20E";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const IL_COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const IL_VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NEW_IL_COMPTROLLER_IMPLEMENTATION = "0x329Bc34E6A46243d21955A4369cD66bdD52E6C22";
const OLD_IL_COMPTROLLER_IMPLEMENTATION = "0x11a92852fA7D70C220Dada69969b2f1C4e18e663";
const NEW_IL_VTOKEN_IMPLEMENTATION = "0xE21251bC79Ee0abebA71FaABDC2Ad36762A0b82F";
const OLD_IL_VTOKEN_IMPLEMENTATION = "0xcA408D716011169645Aa94ddc5665043C33df814";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";

forking(36064000, async () => {
  const provider = ethers.provider;
  let oldPrime: Contract;
  let newPrime: Contract;
  let vaiController: Contract;
  let defaultProxyAdmin: Contract;
  let vaiControllerProxy: Contract;
  let comptroller: Contract;
  let beaconProxyComptroller: Contract;
  let beaconProxyVtoken: Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    await impersonateAccount(USER);
    const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

    oldPrime = new ethers.Contract(PRIME_PROXY, OLD_PRIME_ABI, timelock);
    newPrime = new ethers.Contract(PRIME_PROXY, NEW_PRIME_ABI, timelock);
    vaiController = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, timelock);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_PROXY_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    beaconProxyComptroller = new ethers.Contract(IL_COMPTROLLER_BEACON, BEACON_ABI, provider);
    beaconProxyVtoken = new ethers.Contract(IL_VTOKEN_BEACON, BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("upgrade", async () => {
      let implementation = await defaultProxyAdmin.getProxyImplementation(PRIME_PROXY);
      expect(implementation).to.equal(OLD_PRIME_IMPLEMENTATION);

      implementation = await defaultProxyAdmin.getProxyImplementation(PLP_PROXY);
      expect(implementation).to.equal(OLD_PLP_IMPLEMENTATION);

      implementation = await vaiControllerProxy.vaiControllerImplementation();
      expect(implementation).to.equal(OLD_VAI_CONTROLLER_IMPLEMENTATION);

      implementation = await beaconProxyComptroller.implementation();
      expect(implementation).to.equal(OLD_IL_COMPTROLLER_IMPLEMENTATION);

      implementation = await beaconProxyVtoken.implementation();
      expect(implementation).to.equal(OLD_IL_VTOKEN_IMPLEMENTATION);
    });

    it("apr", async () => {
      const apr = await oldPrime.calculateAPR(vBTC, USER);

      expect(apr[0]).to.be.equal(996);
      expect(apr[1]).to.be.equal(1605);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
      checkVAIController();
    });
  });

  testVip("vip225Testnet", await vip225(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VAI_CONTROLLER_ABI],
        ["NewPrime", "MintOnlyForPrimeHolder", "NewVAIBaseRate", "NewVAIMintCap"],
        [1, 1, 1, 1],
      );
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewVAIMintRate"], [1]);
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
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

      implementation = await beaconProxyComptroller.implementation();
      expect(implementation).to.equal(NEW_IL_COMPTROLLER_IMPLEMENTATION);

      implementation = await beaconProxyVtoken.implementation();
      expect(implementation).to.equal(NEW_IL_VTOKEN_IMPLEMENTATION);
    });

    it("vai prime integration", async () => {
      const primeAddress = await vaiController.prime();
      expect(primeAddress).to.equal(PRIME_PROXY);

      const mintOnlyForPrimeHolder = await vaiController.mintEnabledOnlyForPrimeHolder();
      expect(mintOnlyForPrimeHolder).to.equal(true);
    });

    it("apr (legacy)", async () => {
      const apr = await oldPrime.calculateAPR(vBTC, USER);

      expect(apr.supplyAPR).to.be.equal(996);
      expect(apr.borrowAPR).to.be.equal(1605);
    });

    it("apr (new)", async () => {
      const apr = await newPrime.calculateAPR(vBTC, USER);

      expect(apr.supplyAPR).to.be.equal(996);
      expect(apr.borrowAPR).to.be.equal(1605);
      expect(apr.totalScore).to.be.equal(BigNumber.from("3202493156937100961495"));
      expect(apr.userScore).to.be.equal(BigNumber.from("2024915848628363594635"));
      expect(apr.xvsBalanceForScore).to.be.equal(BigNumber.from("100000000000000000000000"));
      expect(apr.capital).to.be.equal(BigNumber.from("52214401195862928372"));
      expect(apr.cappedSupply).to.be.equal(BigNumber.from("47708882045868937252"));
      expect(apr.cappedBorrow).to.be.equal(BigNumber.from("4505519149993991120"));
      expect(apr.supplyCapUSD).to.be.equal(BigNumber.from("1956161490000000000000000"));
      expect(apr.borrowCapUSD).to.be.equal(BigNumber.from("3912322980000000000000000"));
    });

    it("poolRegistry", async () => {
      const poolRegistry = await newPrime.poolRegistry();

      expect(poolRegistry).to.be.equal(POOL_REGISTRY);
    });

    it("rates", async () => {
      const baseRate = await vaiController.baseRateMantissa();
      expect(baseRate).to.equal(parseUnits("0.07", 18));

      const mintCap = await vaiController.mintCap();
      expect(mintCap).to.equal(parseUnits("20000000", 18));

      const mintRate = await comptroller.vaiMintRate();
      expect(mintRate).to.equal(parseUnits("1", 18));
    });

    it("vai address", async () => {
      const vaiAddress = await vaiController.getVAIAddress();
      expect(vaiAddress).to.equal(VAI);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
      checkVAIController();
      checkIsolatedPoolsComptrollers();
    });
  });
});
