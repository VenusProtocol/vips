import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip571, {
  AAVE,
  ADA,
  BCH,
  CAKE,
  DAI,
  DOGE,
  DOT,
  FDUSD,
  FIL,
  LINK,
  LTC,
  SOL,
  SolvBTC,
  THE,
  TUSD,
  UNI,
  VAI,
  WBETH,
  XRP,
  XVS,
  asBNB,
} from "../../vips/vip-571/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const provider = ethers.provider;

const { bscmainnet } = NETWORK_ADDRESSES;
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

forking(69306243, async () => {
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let impersonatedTimelock: any;

  before(async () => {
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, provider);

    impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  });

  describe("Pre-VIP behavior", async () => {
    it("check AAVE price", async () => {
      const price = await resilientOracle.getPrice(AAVE);
      expect(price).to.be.equal(parseUnits("170.32621913", 18));
    });

    it("check ADA price", async () => {
      const price = await resilientOracle.getPrice(ADA);
      expect(price).to.be.equal(parseUnits("0.40761056", 18));
    });

    it("check asBNB price", async () => {
      const price = await resilientOracle.getPrice(asBNB);
      expect(price).to.be.equal(parseUnits("895.652717622043784833", 18));
    });

    it("check BCH price", async () => {
      const price = await resilientOracle.getPrice(BCH);
      expect(price).to.be.equal(parseUnits("543.200461790000000000", 18));
    });

    it.skip("check CAKE price", async () => {
      const price = await resilientOracle.getPrice(CAKE);
      expect(price).to.be.equal(parseUnits("2.324840000000000000", 18));
    });

    it("check DAI price", async () => {
      const price = await resilientOracle.getPrice(DAI);
      expect(price).to.be.equal(parseUnits("0.99967909", 18));
    });

    it("check DOGE price", async () => {
      const price = await resilientOracle.getPrice(DOGE);
      expect(price).to.be.equal(parseUnits("1454520000", 18));
    });

    it("check DOT price", async () => {
      const price = await resilientOracle.getPrice(DOT);
      expect(price).to.be.equal(parseUnits("2.259085520000000000", 18));
    });

    it("check FDUSD price", async () => {
      const price = await resilientOracle.getPrice(FDUSD);
      expect(price).to.be.equal(parseUnits("0.996830", 18));
    });

    it("check FIL price", async () => {
      const price = await resilientOracle.getPrice(FIL);
      expect(price).to.be.equal(parseUnits("1.61386171", 18));
    });

    it("check LINK price", async () => {
      const price = await resilientOracle.getPrice(LINK);
      expect(price).to.be.equal(parseUnits("12.434677", 18));
    });

    it("check LTC price", async () => {
      const price = await resilientOracle.getPrice(LTC);
      expect(price).to.be.equal(parseUnits("83.031787930000000000", 18));
    });

    it("check SOL price", async () => {
      const price = await resilientOracle.getPrice(SOL);
      expect(price).to.be.equal(parseUnits("129.056394760000000000", 18));
    });

    it("check SolvBTC price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal(parseUnits("85930.196134040000000000", 18));
    });

    it("check THE price", async () => {
      const price = await resilientOracle.getPrice(THE);
      expect(price).to.be.equal(parseUnits("0.147200000000000000", 18));
    });

    it("check TUSD price", async () => {
      const price = await resilientOracle.getPrice(TUSD);
      expect(price).to.be.equal(parseUnits("0.99598455", 18));
    });

    it("check UNI price", async () => {
      const price = await resilientOracle.getPrice(UNI);
      expect(price).to.be.equal(parseUnits("6.1390708", 18));
    });

    it("check VAI price", async () => {
      const price = await resilientOracle.getPrice(VAI);
      expect(price).to.be.equal(parseUnits("0.999048", 18));
    });

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3038.578498421588886094", 18));
    });

    it("check XRP price", async () => {
      const price = await resilientOracle.getPrice(XRP);
      expect(price).to.be.equal(parseUnits("2.058733000000000000", 18));
    });

    it("check XVS price", async () => {
      const price = await resilientOracle.getPrice(XVS);
      expect(price).to.be.equal(parseUnits("4.148370200000000000", 18));
    });
  });

  testVip("VIP-571 bscmainnet", await vip571(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [RESILIENT_ORACLE_ABI, BINANCE_ORACLE_ABI, BOUND_VALIDATOR_ABI],
        ["TokenConfigAdded", "MaxStalePeriodAdded", "ValidateConfigAdded"],
        [21, 21, 21],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      const aave = await new ethers.Contract(AAVE, ERC20_ABI, provider);
      const ada = await new ethers.Contract(ADA, ERC20_ABI, provider);
      const bch = await new ethers.Contract(BCH, ERC20_ABI, provider);
      const cake = await new ethers.Contract(CAKE, ERC20_ABI, provider);
      const dai = await new ethers.Contract(DAI, ERC20_ABI, provider);
      const doge = await new ethers.Contract(DOGE, ERC20_ABI, provider);
      const dot = await new ethers.Contract(DOT, ERC20_ABI, provider);
      const fdusd = await new ethers.Contract(FDUSD, ERC20_ABI, provider);
      const fil = await new ethers.Contract(FIL, ERC20_ABI, provider);
      const link = await new ethers.Contract(LINK, ERC20_ABI, provider);
      const ltc = await new ethers.Contract(LTC, ERC20_ABI, provider);
      const sol = await new ethers.Contract(SOL, ERC20_ABI, provider);
      const tusd = await new ethers.Contract(TUSD, ERC20_ABI, provider);
      const uni = await new ethers.Contract(UNI, ERC20_ABI, provider);
      const vai = await new ethers.Contract(VAI, ERC20_ABI, provider);
      const wbeth = await new ethers.Contract(WBETH, ERC20_ABI, provider);
      const xrp = await new ethers.Contract(XRP, ERC20_ABI, provider);
      const xvs = await new ethers.Contract(XVS, ERC20_ABI, provider);
      const bnb = await new ethers.Contract(ORACLE_BNB, ERC20_ABI, provider);
      const eth = await new ethers.Contract(ETH, ERC20_ABI, provider);

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "AAVE");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "ADA");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "asBNB");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BCH");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "CAKE");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "DAI");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "DOGE");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "DOT");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "FDUSD");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "FIL");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "LINK");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "LTC");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "SOL");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "SolvBTC");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "THE");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "TUSD");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "UNI");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "VAI");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "WBETH");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "XRP");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "XVS");

      await setMaxStalePeriod(resilientOracle, aave);
      await setMaxStalePeriod(resilientOracle, ada);
      await setMaxStalePeriod(resilientOracle, bnb);
      await setMaxStalePeriod(resilientOracle, bch);
      await setMaxStalePeriod(resilientOracle, cake);
      await setMaxStalePeriod(resilientOracle, dai);
      await setMaxStalePeriod(resilientOracle, doge);
      await setMaxStalePeriod(resilientOracle, dot);
      await setMaxStalePeriod(resilientOracle, fdusd);
      await setMaxStalePeriod(resilientOracle, fil);
      await setMaxStalePeriod(resilientOracle, link);
      await setMaxStalePeriod(resilientOracle, ltc);
      await setMaxStalePeriod(resilientOracle, sol);
      await setMaxStalePeriod(resilientOracle, tusd);
      await setMaxStalePeriod(resilientOracle, uni);
      await setMaxStalePeriod(resilientOracle, vai);
      await setMaxStalePeriod(resilientOracle, wbeth);
      await setMaxStalePeriod(resilientOracle, xrp);
      await setMaxStalePeriod(resilientOracle, xvs);
      await setMaxStalePeriod(resilientOracle, eth);

      await redstoneOracle
        .connect(impersonatedTimelock)
        .setDirectPrice(SolvBTC, parseUnits("85930.196134040000000000", 18));
      await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(THE, parseUnits("0.147200000000000000", 18));
    });

    it("check AAVE price", async () => {
      const price = await resilientOracle.getPrice(AAVE);
      expect(price).to.be.equal(parseUnits("170.32621913", 18));
    });

    it("check ADA price", async () => {
      const price = await resilientOracle.getPrice(ADA);
      expect(price).to.be.equal(parseUnits("0.40761056", 18));
    });

    it("check asBNB price", async () => {
      const price = await resilientOracle.getPrice(asBNB);
      expect(price).to.be.equal(parseUnits("896.110983645605175573", 18));
    });

    it("check BCH price", async () => {
      const price = await resilientOracle.getPrice(BCH);
      expect(price).to.be.equal(parseUnits("543.200461790000000000", 18));
    });

    it("check CAKE price", async () => {
      const price = await resilientOracle.getPrice(CAKE);
      expect(price).to.be.equal(parseUnits("2.324840000000000000", 18));
    });

    it("check DAI price", async () => {
      const price = await resilientOracle.getPrice(DAI);
      expect(price).to.be.equal(parseUnits("0.99967909", 18));
    });

    it("check DOGE price", async () => {
      const price = await resilientOracle.getPrice(DOGE);
      expect(price).to.be.equal(parseUnits("1454520000", 18));
    });

    it("check DOT price", async () => {
      const price = await resilientOracle.getPrice(DOT);
      expect(price).to.be.equal(parseUnits("2.259085520000000000", 18));
    });

    it("check FDUSD price", async () => {
      const price = await resilientOracle.getPrice(FDUSD);
      expect(price).to.be.equal(parseUnits("0.996830", 18));
    });

    it("check FIL price", async () => {
      const price = await resilientOracle.getPrice(FIL);
      expect(price).to.be.equal(parseUnits("1.61386171", 18));
    });

    it("check LINK price", async () => {
      const price = await resilientOracle.getPrice(LINK);
      expect(price).to.be.equal(parseUnits("12.434677", 18));
    });

    it("check LTC price", async () => {
      const price = await resilientOracle.getPrice(LTC);
      expect(price).to.be.equal(parseUnits("83.031787930000000000", 18));
    });

    it("check SOL price", async () => {
      const price = await resilientOracle.getPrice(SOL);
      expect(price).to.be.equal(parseUnits("129.056394760000000000", 18));
    });

    it("check SolvBTC price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal(parseUnits("85930.196134040000000000", 18));
    });

    it("check THE price", async () => {
      const price = await resilientOracle.getPrice(THE);
      expect(price).to.be.equal(parseUnits("0.147200000000000000", 18));
    });

    it("check TUSD price", async () => {
      const price = await resilientOracle.getPrice(TUSD);
      expect(price).to.be.equal(parseUnits("0.99598455", 18));
    });

    it("check UNI price", async () => {
      const price = await resilientOracle.getPrice(UNI);
      expect(price).to.be.equal(parseUnits("6.1390708", 18));
    });

    it("check VAI price", async () => {
      const price = await resilientOracle.getPrice(VAI);
      expect(price).to.be.equal(parseUnits("0.999048", 18));
    });

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3038.578498421588886094", 18));
    });

    it("check XRP price", async () => {
      const price = await resilientOracle.getPrice(XRP);
      expect(price).to.be.equal(parseUnits("2.058733000000000000", 18));
    });

    it("check XVS price", async () => {
      const price = await resilientOracle.getPrice(XVS);
      expect(price).to.be.equal(parseUnits("4.148370200000000000", 18));
    });
  });
});
