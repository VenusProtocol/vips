import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkIsolatedPoolsComptrollers } from "../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVAIController } from "../../../src/vip-framework/checks/checkVAIController";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip225 } from "../../../vips/vip-225/vip-225";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import NEW_PRIME_ABI from "./abi/newPrime.json";
import OLD_PRIME_ABI from "./abi/oldPrime.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import VAI_CONTROLLER_PROXY_ABI from "./abi/vaiControllerProxy.json";

const PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const OLD_PRIME_IMPLEMENTATION = "0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03";
const OLD_VAI_CONTROLLER_IMPLEMENTATION = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const NEW_PRIME_IMPLEMENTATION = "0x7A2e3481F345367045539896e5Bf385910fB5C2C";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0x9817823d5C4023EFb6173099928F17bb77CD1d69";
const NEW_PLP_IMPLEMENTATION = "0x208068AE8A619FCc851659791659B1aA40d796dA";
const OLD_PLP_IMPLEMENTATION = "0xf0361f9B3dcCa728603be2aBf15D1Ec106d43D51";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const USER = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const BTC_CHAINLINK_FEED = "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const IL_COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const IL_VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
const NEW_IL_COMPTROLLER_IMPLEMENTATION = "0x3F66e044dfd1Ccc834e55624B5f6e9e75ab36000";
const OLD_IL_COMPTROLLER_IMPLEMENTATION = "0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2";
const NEW_IL_VTOKEN_IMPLEMENTATION = "0x9A8ADe92b2D71497b6F19607797F2697cF30f03A";
const OLD_IL_VTOKEN_IMPLEMENTATION = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const XVS_CHAINLINK_FEED = "0xbf63f430a79d4036a5900c19818aff1fa710f206";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";

forking(34778191, async () => {
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

    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, BTC, BTC_CHAINLINK_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, XVS, XVS_CHAINLINK_FEED, NORMAL_TIMELOCK);
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

      expect(apr[0]).to.be.equal(290);
      expect(apr[1]).to.be.equal(290);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
      checkVAIController();
    });
  });

  testVip("vip225", await vip225(), {
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

      expect(apr.supplyAPR).to.be.equal(290);
      expect(apr.borrowAPR).to.be.equal(290);
    });

    it("apr (new)", async () => {
      const apr = await newPrime.calculateAPR(vBTC, USER);

      expect(apr.supplyAPR).to.be.equal(290);
      expect(apr.borrowAPR).to.be.equal(290);

      expect(apr.totalScore).to.be.equal(BigNumber.from("19966646304707257624974"));
      expect(apr.userScore).to.be.equal(BigNumber.from("1286183384953907736607"));
      expect(apr.xvsBalanceForScore).to.be.equal(BigNumber.from("56183554851760828762240"));
      expect(apr.capital).to.be.equal(BigNumber.from("29444368744734773254"));
      expect(apr.cappedSupply).to.be.equal(BigNumber.from("27222685677053228328"));
      expect(apr.cappedBorrow).to.be.equal(BigNumber.from("2221683067681544926"));
      expect(apr.supplyCapUSD).to.be.equal(BigNumber.from("1361781824169656345653497"));
      expect(apr.borrowCapUSD).to.be.equal(BigNumber.from("2723563648339312691306994"));
    });

    it("poolRegistry", async () => {
      const poolRegistry = await newPrime.poolRegistry();

      expect(poolRegistry).to.be.equal(POOL_REGISTRY);
    });

    it("rates", async () => {
      const baseRate = await vaiController.baseRateMantissa();
      expect(baseRate).to.equal(parseUnits("0.07", 18));

      const mintCap = await vaiController.mintCap();
      expect(mintCap).to.equal(parseUnits("10000000", 18));

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
