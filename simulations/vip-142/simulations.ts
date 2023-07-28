import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip142 } from "../../vips/vip-142";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VTOKEN_ABI from "./abi/VToken.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const DeFi_Pool = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VANKR_DeFi = "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362";
const VBSW_DeFi = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
const VALPACA_DeFi = "0x02c5Fb0F26761093D297165e902e96D08576D344";
const VUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";
const VUSDD_DeFi = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";

const GameFi_Pool = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const VFLOKI_GameFi = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
const VRACA_GameFi = "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465";
const VUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const VUSDD_GameFi = "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C";

const LiquidStakedBNB_Pool = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const VankrBNB_LiquidStakedBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const VBNBx_LiquidStakedBNB = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const VstkBNB_LiquidStakedBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
const VWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

const StableCoin_Pool = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const VHAY_Stablecoins = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const VUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDD_Stablecoins = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";

const Tron_Pool = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const VBTT_Tron = "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee";
const VWIN_Tron = "0xb114cfA615c828D88021a41bFc524B800E64a9D5";
const VTRX_Tron = "0x836beb2cB723C498136e1119248436A645845F4E";
const VUSDT_Tron = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";
const VUSDD_Tron = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vUSDT_DeFi_Rate_Model = "0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac";
const vUSDD_DeFi_Rate_Model = "0xD9d10f63d736dc2D5271Ce7E94C4B07E114D7c76";
const vUSDT_GameFi_Rate_Model = "0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac";
const vUSDD_GameFi_Rate_Model = "0xD9d10f63d736dc2D5271Ce7E94C4B07E114D7c76";
const vWBNB_LiquidStakedBNB_Rate_Model = "0x6765202c3e6d3FdD05F0b26105d0C8DF59D3efaf";
const vHAY_Stablecoins_Rate_Model = "0xCaaa2ae0A8F30f0BF76568B3764Fd639B5171a59";
const vUSDT_Stablecoins_Rate_Model = "0xf63BcB7B4B72fe5B26318098d5f38499710bA731";
const vUSDD_Stablecoins_Rate_Model = "0x12D290de159341d36BB1a5A58904aD95053BDB20";
const vUSDT_Tron_Rate_Model = "0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac";
const vUSDD_Tron_Rate_Model = "0xD9d10f63d736dc2D5271Ce7E94C4B07E114D7c76";

forking(29870474, () => {
  let DeFi_Pool_Comptroller: ethers.Contract;
  let GameFi_Pool_Comptroller: ethers.Contract;
  let LiquidStakedBNB_Pool_Comptroller: ethers.Contract;
  let StableCoin_Pool_Comptroller: ethers.Contract;
  let Tron_Pool_Comptroller: ethers.Contract;

  let vBSW_DeFi: ethers.Contract;
  let vALPACA_DeFi: ethers.Contract;
  let vUSDT_DeFi: ethers.Contract;
  let vUSDD_DeFi: ethers.Contract;

  let vUSDT_GameFi: ethers.Contract;
  let vUSDD_GameFi: ethers.Contract;

  let vBNBx_LiquidStakedBNB: ethers.Contract;
  let vWBNB_LiquidStakedBNB: ethers.Contract;

  let vHAY_Stablecoins: ethers.Contract;
  let vUSDT_Stablecoins: ethers.Contract;
  let vUSDD_Stablecoins: ethers.Contract;

  let vWIN_Tron: ethers.Contract;
  let vTRX_Tron: ethers.Contract;
  let vUSDT_Tron: ethers.Contract;
  let vUSDD_Tron: ethers.Contract;

  let rateModel: ethers.Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    DeFi_Pool_Comptroller = new ethers.Contract(DeFi_Pool, COMPTROLLER_ABI, provider);
    GameFi_Pool_Comptroller = new ethers.Contract(GameFi_Pool, COMPTROLLER_ABI, provider);
    LiquidStakedBNB_Pool_Comptroller = new ethers.Contract(LiquidStakedBNB_Pool, COMPTROLLER_ABI, provider);
    StableCoin_Pool_Comptroller = new ethers.Contract(StableCoin_Pool, COMPTROLLER_ABI, provider);
    Tron_Pool_Comptroller = new ethers.Contract(Tron_Pool, COMPTROLLER_ABI, provider);

    vBSW_DeFi = new ethers.Contract(VBSW_DeFi, VTOKEN_ABI, ethers.provider);
    vALPACA_DeFi = new ethers.Contract(VALPACA_DeFi, VTOKEN_ABI, ethers.provider);
    vUSDT_DeFi = new ethers.Contract(VUSDT_DeFi, VTOKEN_ABI, ethers.provider);
    vUSDD_DeFi = new ethers.Contract(VUSDD_DeFi, VTOKEN_ABI, ethers.provider);

    vUSDT_GameFi = new ethers.Contract(VUSDT_GameFi, VTOKEN_ABI, ethers.provider);
    vUSDD_GameFi = new ethers.Contract(VUSDD_GameFi, VTOKEN_ABI, ethers.provider);

    vBNBx_LiquidStakedBNB = new ethers.Contract(VBNBx_LiquidStakedBNB, VTOKEN_ABI, ethers.provider);
    vWBNB_LiquidStakedBNB = new ethers.Contract(VWBNB_LiquidStakedBNB, VTOKEN_ABI, ethers.provider);

    vHAY_Stablecoins = new ethers.Contract(VHAY_Stablecoins, VTOKEN_ABI, ethers.provider);
    vUSDT_Stablecoins = new ethers.Contract(VUSDT_Stablecoins, VTOKEN_ABI, ethers.provider);
    vUSDD_Stablecoins = new ethers.Contract(VUSDD_Stablecoins, VTOKEN_ABI, ethers.provider);

    vWIN_Tron = new ethers.Contract(VWIN_Tron, VTOKEN_ABI, ethers.provider);
    vTRX_Tron = new ethers.Contract(VTRX_Tron, VTOKEN_ABI, ethers.provider);
    vUSDT_Tron = new ethers.Contract(VUSDT_Tron, VTOKEN_ABI, ethers.provider);
    vUSDD_Tron = new ethers.Contract(VUSDD_Tron, VTOKEN_ABI, ethers.provider);

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vBSW_DeFi.underlying(),
      "0x08E70777b982a58D23D05E3D7714f44837c06A21",
      NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vALPACA_DeFi.underlying(),
      "0xe0073b60833249ffd1bb2af809112c2fbf221DF6",
      NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vUSDT_DeFi.underlying(),
      "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vWBNB_LiquidStakedBNB.underlying(),
      "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vBNBx_LiquidStakedBNB.underlying(),
      "0xc4429B539397a3166eF3ef132c29e34715a3ABb4",
      NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vWIN_Tron.underlying(),
      "0x9e7377E194E41d63795907c92c3EB351a2eb0233",
      NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      await vTRX_Tron.underlying(),
      "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be",
      NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "ANKR");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "USDD");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "FLOKI");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "RACA");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "ankrBNB");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "stkBNB");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "HAY");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "BTT");
  });

  describe("Pre-VIP behavior", async () => {
    describe("DeFi Pool", async () => {
      it("supply cap of ANKR equals 9,508,802", async () => {
        const oldCap = await DeFi_Pool_Comptroller.supplyCaps(VANKR_DeFi);
        expect(oldCap).to.equal(parseUnits("9508802", 18));
      });

      it("supply cap of BSW equals 15,000,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.supplyCaps(VBSW_DeFi);
        expect(oldCap).to.equal(parseUnits("15000000", 18));
      });

      it("supply cap of ALPACA equals 2,500,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.supplyCaps(VALPACA_DeFi);
        expect(oldCap).to.equal(parseUnits("2500000", 18));
      });

      it("supply cap of USDT equals 18,600,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.supplyCaps(VUSDT_DeFi);
        expect(oldCap).to.equal(parseUnits("18600000", 18));
      });

      it("supply cap of USDD equals 2000000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.supplyCaps(VUSDD_DeFi);
        expect(oldCap).to.equal(parseUnits("2000000", 18));
      });

      it("borrow cap of ANKR equals 6,656,161", async () => {
        const oldCap = await DeFi_Pool_Comptroller.borrowCaps(VANKR_DeFi);
        expect(oldCap).to.equal(parseUnits("6656161", 18));
      });

      it("borrow cap of BSW equals 10,500,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.borrowCaps(VBSW_DeFi);
        expect(oldCap).to.equal(parseUnits("10500000", 18));
      });

      it("borrow cap of ALPACA equals 1,750,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.borrowCaps(VALPACA_DeFi);
        expect(oldCap).to.equal(parseUnits("1750000", 18));
      });

      it("borrow cap of USDT equals 14,880,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.borrowCaps(VUSDT_DeFi);
        expect(oldCap).to.equal(parseUnits("14880000", 18));
      });

      it("borrow cap of USDD equals 1,600,000", async () => {
        const oldCap = await DeFi_Pool_Comptroller.borrowCaps(VUSDD_DeFi);
        expect(oldCap).to.equal(parseUnits("1600000", 18));
      });

      it("collateral factor of ANKR equals 25%", async () => {
        const collateralFactor = (await DeFi_Pool_Comptroller.markets(VANKR_DeFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("collateral factor of BSW equals 25%", async () => {
        const collateralFactor = (await DeFi_Pool_Comptroller.markets(VBSW_DeFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("collateral factor of ALPACA equals 25%", async () => {
        const collateralFactor = (await DeFi_Pool_Comptroller.markets(VALPACA_DeFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("collateral factor of USDT equals 80%", async () => {
        const collateralFactor = (await DeFi_Pool_Comptroller.markets(VUSDT_DeFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.8", 18));
      });

      it("liquidation threshold of USDT equals 88%", async () => {
        const liquidationThreshold = (await DeFi_Pool_Comptroller.markets(VUSDT_DeFi)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.88", 18));
      });
    });

    describe("GameFi Pool", async () => {
      it("supply cap of FLOKI equals 40,000,000,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.supplyCaps(VFLOKI_GameFi);
        expect(oldCap).to.equal(parseUnits("40000000000", 9));
      });

      it("supply cap of RACA equals 4,000,000,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.supplyCaps(VRACA_GameFi);
        expect(oldCap).to.equal(parseUnits("4000000000", 18));
      });

      it("supply cap of USDT equals 18,600,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.supplyCaps(VUSDT_GameFi);
        expect(oldCap).to.equal(parseUnits("18600000", 18));
      });

      it("supply cap of USDD equals 2,000,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.supplyCaps(VUSDD_GameFi);
        expect(oldCap).to.equal(parseUnits("2000000", 18));
      });

      it("borrow cap of FLOKI equals 28,000,000,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.borrowCaps(VFLOKI_GameFi);
        expect(oldCap).to.equal(parseUnits("28000000000", 9));
      });

      it("borrow cap of RACA equals 2,800,000,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.borrowCaps(VRACA_GameFi);
        expect(oldCap).to.equal(parseUnits("2800000000", 18));
      });

      it("borrow cap of USDT equals 14,880,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.borrowCaps(VUSDT_GameFi);
        expect(oldCap).to.equal(parseUnits("14880000", 18));
      });

      it("borrow cap of USDD equals 1,600,000", async () => {
        const oldCap = await GameFi_Pool_Comptroller.borrowCaps(VUSDD_GameFi);
        expect(oldCap).to.equal(parseUnits("1600000", 18));
      });

      it("collateral factor of FLOKI equals 25%", async () => {
        const collateralFactor = (await GameFi_Pool_Comptroller.markets(VFLOKI_GameFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("collateral factor of RACA equals 25%", async () => {
        const collateralFactor = (await GameFi_Pool_Comptroller.markets(VRACA_GameFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("liquidation threshold of RACA equals 30%", async () => {
        const liquidationThreshold = (await GameFi_Pool_Comptroller.markets(VRACA_GameFi)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.30", 18));
      });

      it("collateral factor of USDT equals 80%", async () => {
        const collateralFactor = (await GameFi_Pool_Comptroller.markets(VUSDT_GameFi)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.8", 18));
      });

      it("liquidation threshold of USDT equals 88%", async () => {
        const liquidationThreshold = (await GameFi_Pool_Comptroller.markets(VUSDT_GameFi)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.88", 18));
      });
    });

    describe("LiquidStakedBNB Pool", async () => {
      it("supply cap of BNBx equals 1,818", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VBNBx_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("1818", 18));
      });

      it("supply cap of stkBNB equals 540", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VstkBNB_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("540", 18));
      });

      it("supply cap of WBNB equals 80,000", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VWBNB_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("80000", 18));
      });

      it("borrow cap of ankrBNB equals 5,600", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VankrBNB_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("5600", 18));
      });

      it("borrow cap of BNBx equals 1,272", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VBNBx_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("1272", 18));
      });

      it("borrow cap of stkBNB equals 378", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VstkBNB_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("378", 18));
      });

      it("borrow cap of WBNB equals 56,000", async () => {
        const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VWBNB_LiquidStakedBNB);
        expect(oldCap).to.equal(parseUnits("56000", 18));
      });

      it("collateral factor of ankrBNB equals 35%", async () => {
        const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VankrBNB_LiquidStakedBNB))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.35", 18));
      });

      it("liquidation threshold of ankrBNB equals 0.4%", async () => {
        const liquidationThreshold = (await LiquidStakedBNB_Pool_Comptroller.markets(VankrBNB_LiquidStakedBNB))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.4", 18));
      });

      it("collateral factor of BNBx equals 35%", async () => {
        const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VBNBx_LiquidStakedBNB))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.35", 18));
      });

      it("liquidation threshold of BNBx equals 40%", async () => {
        const liquidationThreshold = (await LiquidStakedBNB_Pool_Comptroller.markets(VBNBx_LiquidStakedBNB))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.40", 18));
      });

      it("collateral factor of stkBNB equals 35%", async () => {
        const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VstkBNB_LiquidStakedBNB))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.35", 18));
      });

      it("liquidation threshold of stkBNB equals 40%", async () => {
        const liquidationThreshold = (await LiquidStakedBNB_Pool_Comptroller.markets(VstkBNB_LiquidStakedBNB))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.40", 18));
      });

      it("collateral factor of WBNB equals 45%", async () => {
        const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VWBNB_LiquidStakedBNB))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.45", 18));
      });

      it("liquidation threshold of WBNB equals 50%", async () => {
        const liquidationThreshold = (await LiquidStakedBNB_Pool_Comptroller.markets(VWBNB_LiquidStakedBNB))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.50", 18));
      });
    });

    describe("StableCoins Pool", async () => {
      it("supply cap of USDT equals 1,000,000", async () => {
        const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(VUSDT_Stablecoins);
        expect(oldCap).to.equal(parseUnits("1000000", 18));
      });

      it("supply cap of USDD equals 1,000,000", async () => {
        const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(VUSDD_Stablecoins);
        expect(oldCap).to.equal(parseUnits("1000000", 18));
      });

      it("borrow cap of HAY equals 200,000", async () => {
        const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(VHAY_Stablecoins);
        expect(oldCap).to.equal(parseUnits("200000", 18));
      });

      it("borrow cap of USDT equals 400,000", async () => {
        const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(VUSDT_Stablecoins);
        expect(oldCap).to.equal(parseUnits("400000", 18));
      });

      it("borrow cap of USDD equals 400,000", async () => {
        const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(VUSDD_Stablecoins);
        expect(oldCap).to.equal(parseUnits("400000", 18));
      });

      it("collateral factor of HAY equals 65%", async () => {
        const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VHAY_Stablecoins)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.65", 18));
      });

      it("reserve factor of HAY equals 20%", async () => {
        const reserveFactor = await vHAY_Stablecoins.reserveFactorMantissa();
        expect(reserveFactor).to.equal(parseUnits("0.2", 18));
      });

      it("liquidation threshold of HAY equals 70%", async () => {
        const liquidationThreshold = (await StableCoin_Pool_Comptroller.markets(VHAY_Stablecoins))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.70", 18));
      });

      it("collateral factor of USDT equals 80%", async () => {
        const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDT_Stablecoins))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.80", 18));
      });

      it("liquidation threshold of USDT equals 88%", async () => {
        const liquidationThreshold = (await StableCoin_Pool_Comptroller.markets(VUSDT_Stablecoins))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.88", 18));
      });

      it("collateral factor of USDD equals 65%", async () => {
        const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDD_Stablecoins))
          .collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.65", 18));
      });

      it("liquidation threshold of USDD equals 70%", async () => {
        const liquidationThreshold = (await StableCoin_Pool_Comptroller.markets(VUSDD_Stablecoins))
          .liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.70", 18));
      });
    });

    describe("Tron Pool", async () => {
      it("supply cap of BTT equals 1,500,000,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.supplyCaps(VBTT_Tron);
        expect(oldCap).to.equal(parseUnits("1500000000000", 18));
      });

      it("supply cap of WIN equals 3,000,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.supplyCaps(VWIN_Tron);
        expect(oldCap).to.equal(parseUnits("3000000000", 18));
      });

      it("supply cap of TRX equals 11,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.supplyCaps(VTRX_Tron);
        expect(oldCap).to.equal(parseUnits("11000000", 6));
      });

      it("supply cap of USDT equals 18,600,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.supplyCaps(VUSDT_Tron);
        expect(oldCap).to.equal(parseUnits("18600000", 18));
      });

      it("supply cap of USDD equals 2,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.supplyCaps(VUSDD_Tron);
        expect(oldCap).to.equal(parseUnits("2000000", 18));
      });

      it("borrow cap of BTT equals 1,050,000,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.borrowCaps(VBTT_Tron);
        expect(oldCap).to.equal(parseUnits("1050000000000", 18));
      });

      it("borrow cap of WIN equals 2,100,000,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.borrowCaps(VWIN_Tron);
        expect(oldCap).to.equal(parseUnits("2100000000", 18));
      });

      it("borrow cap of TRX equals 7,700,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.borrowCaps(VTRX_Tron);
        expect(oldCap).to.equal(parseUnits("7700000", 6));
      });

      it("borrow cap of USDT equals 14,880,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.borrowCaps(VUSDT_Tron);
        expect(oldCap).to.equal(parseUnits("14880000", 18));
      });

      it("borrow cap of USDD equals 1,600,000", async () => {
        const oldCap = await Tron_Pool_Comptroller.borrowCaps(VUSDD_Tron);
        expect(oldCap).to.equal(parseUnits("1600000", 18));
      });

      it("collateral factor of BTT equals 25%", async () => {
        const collateralFactor = (await Tron_Pool_Comptroller.markets(VBTT_Tron)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("liquidation threshold of BTT equals 30%", async () => {
        const liquidationThreshold = (await Tron_Pool_Comptroller.markets(VBTT_Tron)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.30", 18));
      });

      it("collateral factor of WIN equals 25%", async () => {
        const collateralFactor = (await Tron_Pool_Comptroller.markets(VWIN_Tron)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("liquidation threshold of WIN equals 30%", async () => {
        const liquidationThreshold = (await Tron_Pool_Comptroller.markets(VWIN_Tron)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.30", 18));
      });

      it("collateral factor of TRX equals 25%", async () => {
        const collateralFactor = (await Tron_Pool_Comptroller.markets(VTRX_Tron)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.25", 18));
      });

      it("liquidation threshold of TRX equals 30%", async () => {
        const liquidationThreshold = (await Tron_Pool_Comptroller.markets(VTRX_Tron)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.30", 18));
      });

      it("collateral factor of USDT equals 80%", async () => {
        const collateralFactor = (await Tron_Pool_Comptroller.markets(VUSDT_Tron)).collateralFactorMantissa;
        expect(collateralFactor).to.equal(parseUnits("0.80", 18));
      });

      it("liquidation threshold of USDT equals 88%", async () => {
        const liquidationThreshold = (await Tron_Pool_Comptroller.markets(VUSDT_Tron)).liquidationThresholdMantissa;
        expect(liquidationThreshold).to.equal(parseUnits("0.88", 18));
      });
    });
  });

  testVip("VIP-142 Risk Parameters Update", vip142(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewReserveFactor",
          "NewMarketInterestRateModel",
        ],
        [18, 15, 19, 21, 1, 10],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("DeFi Pool", async () => {
      describe("Caps Check", async () => {
        it("supply cap of ANKR equals 17,700,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.supplyCaps(VANKR_DeFi);
          expect(newCap).to.equal(parseUnits("17700000", 18));
        });

        it("supply cap of BSW equals 11,600,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.supplyCaps(VBSW_DeFi);
          expect(newCap).to.equal(parseUnits("11600000", 18));
        });

        it("supply cap of ALPACA equals 1,500,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.supplyCaps(VALPACA_DeFi);
          expect(newCap).to.equal(parseUnits("1500000", 18));
        });

        it("supply cap of USDT equals 1,387,500", async () => {
          const newCap = await DeFi_Pool_Comptroller.supplyCaps(VUSDT_DeFi);
          expect(newCap).to.equal(parseUnits("1387500", 18));
        });

        it("supply cap of USDD equals 450,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.supplyCaps(VUSDD_DeFi);
          expect(newCap).to.equal(parseUnits("450000", 18));
        });

        it("borrow cap of ANKR equals 8,850,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.borrowCaps(VANKR_DeFi);
          expect(newCap).to.equal(parseUnits("8850000", 18));
        });

        it("borrow cap of BSW equals 5,800,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.borrowCaps(VBSW_DeFi);
          expect(newCap).to.equal(parseUnits("5800000", 18));
        });

        it("borrow cap of ALPACA equals 750,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.borrowCaps(VALPACA_DeFi);
          expect(newCap).to.equal(parseUnits("750000", 18));
        });

        it("borrow cap of USDT equals 925,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.borrowCaps(VUSDT_DeFi);
          expect(newCap).to.equal(parseUnits("925000", 18));
        });

        it("borrow cap of USDD equals 300,000", async () => {
          const newCap = await DeFi_Pool_Comptroller.borrowCaps(VUSDD_DeFi);
          expect(newCap).to.equal(parseUnits("300000", 18));
        });

        it("collateral factor of ANKR equals 20%", async () => {
          const collateralFactor = (await DeFi_Pool_Comptroller.markets(VANKR_DeFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.20", 18));
        });

        it("collateral factor of BSW equals 20%", async () => {
          const collateralFactor = (await DeFi_Pool_Comptroller.markets(VBSW_DeFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.20", 18));
        });

        it("collateral factor of ALPACA equals 20%", async () => {
          const collateralFactor = (await DeFi_Pool_Comptroller.markets(VALPACA_DeFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.20", 18));
        });

        it("collateral factor of USDT equals 75%", async () => {
          const collateralFactor = (await DeFi_Pool_Comptroller.markets(VUSDT_DeFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of USDT equals 80%", async () => {
          const collateralFactor = (await DeFi_Pool_Comptroller.markets(VUSDT_DeFi)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });
      });

      describe("Interest Rate Model", async () => {
        it("Address Checks", async () => {
          let rateModel = await vUSDT_DeFi.interestRateModel();
          expect(rateModel).to.equal(vUSDT_DeFi_Rate_Model);

          rateModel = await vUSDD_DeFi.interestRateModel();
          expect(rateModel).to.equal(vUSDD_DeFi_Rate_Model);
        });

        it("USDT Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDT_DeFi_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });

        it("USDD Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDD_DeFi_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.7", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });
      });
    });

    describe("GameFi Pool", async () => {
      describe("Caps Check", async () => {
        it("supply cap of FLOKI equals 22,000,000,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.supplyCaps(VFLOKI_GameFi);
          expect(newCap).to.equal(parseUnits("22000000000", 9));
        });

        it("supply cap of RACA equals 4,200,000,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.supplyCaps(VRACA_GameFi);
          expect(newCap).to.equal(parseUnits("4200000000", 18));
        });

        it("supply cap of USDT equals 1,200,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.supplyCaps(VUSDT_GameFi);
          expect(newCap).to.equal(parseUnits("1200000", 18));
        });

        it("supply cap of USDD equals 450,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.supplyCaps(VUSDD_GameFi);
          expect(newCap).to.equal(parseUnits("450000", 18));
        });

        it("borrow cap of FLOKI equals 11,000,000,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.borrowCaps(VFLOKI_GameFi);
          expect(newCap).to.equal(parseUnits("11000000000", 9));
        });

        it("borrow cap of RACA equals 2,100,000,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.borrowCaps(VRACA_GameFi);
          expect(newCap).to.equal(parseUnits("2100000000", 18));
        });

        it("borrow cap of USDT equals 800,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.borrowCaps(VUSDT_GameFi);
          expect(newCap).to.equal(parseUnits("800000", 18));
        });

        it("borrow cap of USDD equals 300,000", async () => {
          const newCap = await GameFi_Pool_Comptroller.borrowCaps(VUSDD_GameFi);
          expect(newCap).to.equal(parseUnits("300000", 18));
        });

        it("collateral factor of FLOKI equals 40%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VFLOKI_GameFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.40", 18));
        });

        it("liquidation threshold of FLOKI equals 50%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VFLOKI_GameFi)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.50", 18));
        });

        it("collateral factor of RACA equals 40%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VRACA_GameFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.40", 18));
        });

        it("liquidation threshold of RACA equals 50%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VRACA_GameFi)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.50", 18));
        });

        it("collateral factor of USDT equals 75%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VUSDT_GameFi)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of USDT equals 80%", async () => {
          const collateralFactor = (await GameFi_Pool_Comptroller.markets(VUSDT_GameFi)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });
      });
      describe("Interest Rate Model", async () => {
        it("Address Checks", async () => {
          let rateModel = await vUSDT_GameFi.interestRateModel();
          expect(rateModel).to.equal(vUSDT_GameFi_Rate_Model);

          rateModel = await vUSDD_GameFi.interestRateModel();
          expect(rateModel).to.equal(vUSDD_GameFi_Rate_Model);
        });

        it("USDT Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDT_GameFi_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });

        it("USDD Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDD_GameFi_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.7", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });
      });
    });

    describe("LiquidStakedBNB Pool", async () => {
      describe("Caps Check", async () => {
        it("supply cap of BNBx equals 9,600", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VBNBx_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("9600", 18));
        });

        it("supply cap of stkBNB equals 2,900", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VstkBNB_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("2900", 18));
        });

        it("supply cap of WBNB equals 24,000", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(VWBNB_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("24000", 18));
        });

        it("borrow cap of ankrBNB equals 800", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VankrBNB_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("800", 18));
        });

        it("borrow cap of BNBx equals 960", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VBNBx_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("960", 18));
        });

        it("borrow cap of stkBNB equals 290", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VstkBNB_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("290", 18));
        });

        it("borrow cap of WBNB equals 16,000", async () => {
          const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(VWBNB_LiquidStakedBNB);
          expect(newCap).to.equal(parseUnits("16000", 18));
        });

        it("collateral factor of ankrBNB equals 87%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VankrBNB_LiquidStakedBNB))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.87", 18));
        });

        it("liquidation threshold of ankrBNB equals 0.90%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VankrBNB_LiquidStakedBNB))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.90", 18));
        });

        it("collateral factor of BNBx equals 87%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VBNBx_LiquidStakedBNB))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.87", 18));
        });

        it("liquidation threshold of BNBx equals 90%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VBNBx_LiquidStakedBNB))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.90", 18));
        });

        it("collateral factor of stkBNB equals 87%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VstkBNB_LiquidStakedBNB))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.87", 18));
        });

        it("liquidation threshold of stkBNB equals 90%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VstkBNB_LiquidStakedBNB))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.90", 18));
        });

        it("collateral factor of WBNB equals 77%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VWBNB_LiquidStakedBNB))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.77", 18));
        });

        it("liquidation threshold of WBNB equals 80%", async () => {
          const collateralFactor = (await LiquidStakedBNB_Pool_Comptroller.markets(VWBNB_LiquidStakedBNB))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });
      });

      describe("Interest Rate Model", async () => {
        it("Address Checks", async () => {
          const rateModel = await vWBNB_LiquidStakedBNB.interestRateModel();
          expect(rateModel).to.equal(vWBNB_LiquidStakedBNB_Rate_Model);
        });

        it("vWBNB Parameters Check", async () => {
          rateModel = new ethers.Contract(vWBNB_LiquidStakedBNB_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.01", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.035", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
        });
      });
    });

    describe("StableCoins Pool", async () => {
      describe("Caps Check", async () => {
        it("supply cap of USDT equals 960,000", async () => {
          const newCap = await StableCoin_Pool_Comptroller.supplyCaps(VUSDT_Stablecoins);
          expect(newCap).to.equal(parseUnits("960000", 18));
        });

        it("supply cap of USDD equals 240,000", async () => {
          const newCap = await StableCoin_Pool_Comptroller.supplyCaps(VUSDD_Stablecoins);
          expect(newCap).to.equal(parseUnits("240000", 18));
        });

        it("borrow cap of HAY equals 250,000", async () => {
          const newCap = await StableCoin_Pool_Comptroller.borrowCaps(VHAY_Stablecoins);
          expect(newCap).to.equal(parseUnits("250000", 18));
        });

        it("borrow cap of USDT equals 640,000", async () => {
          const newCap = await StableCoin_Pool_Comptroller.borrowCaps(VUSDT_Stablecoins);
          expect(newCap).to.equal(parseUnits("640000", 18));
        });

        it("borrow cap of USDD equals 160,000", async () => {
          const newCap = await StableCoin_Pool_Comptroller.borrowCaps(VUSDD_Stablecoins);
          expect(newCap).to.equal(parseUnits("160000", 18));
        });

        it("collateral factor of HAY equals 75%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VHAY_Stablecoins))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of HAY equals 80%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VHAY_Stablecoins))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });

        it("reserve factor of HAY equals 10%", async () => {
          const reserveFactor = await vHAY_Stablecoins.reserveFactorMantissa();
          expect(reserveFactor).to.equal(parseUnits("0.1", 18));
        });

        it("collateral factor of USDT equals 75%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDT_Stablecoins))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of USDT equals 80%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDT_Stablecoins))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });

        it("collateral factor of USDD equals 75%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDD_Stablecoins))
            .collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of USDD equals 80%", async () => {
          const collateralFactor = (await StableCoin_Pool_Comptroller.markets(VUSDD_Stablecoins))
            .liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });
      });

      describe("Interest Rate Model", async () => {
        it("Address Checks", async () => {
          let rateModel = await vHAY_Stablecoins.interestRateModel();
          expect(rateModel).to.equal(vHAY_Stablecoins_Rate_Model);

          rateModel = await vUSDT_Stablecoins.interestRateModel();
          expect(rateModel).to.equal(vUSDT_Stablecoins_Rate_Model);

          rateModel = await vUSDD_Stablecoins.interestRateModel();
          expect(rateModel).to.equal(vUSDD_Stablecoins_Rate_Model);
        });

        it("HAY Parameters Check", async () => {
          rateModel = new ethers.Contract(vHAY_Stablecoins_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.5", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });

        it("USDT Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDT_Stablecoins_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });

        it("USDD Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDD_Stablecoins_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.7", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });
      });
    });

    describe("Tron Pool", async () => {
      describe("Caps Check", async () => {
        it("supply cap of BTT equals 1,130,000,000,000", async () => {
          const newCap = await Tron_Pool_Comptroller.supplyCaps(VBTT_Tron);
          expect(newCap).to.equal(parseUnits("1130000000000", 18));
        });

        it("supply cap of WIN equals 2,300,000,000", async () => {
          const newCap = await Tron_Pool_Comptroller.supplyCaps(VWIN_Tron);
          expect(newCap).to.equal(parseUnits("2300000000", 18));
        });

        it("supply cap of TRX equals 6,300,000", async () => {
          const newCap = await Tron_Pool_Comptroller.supplyCaps(VTRX_Tron);
          expect(newCap).to.equal(parseUnits("6300000", 6));
        });

        it("supply cap of USDT equals 1,380,000", async () => {
          const newCap = await Tron_Pool_Comptroller.supplyCaps(VUSDT_Tron);
          expect(newCap).to.equal(parseUnits("1380000", 18));
        });

        it("supply cap of USDD equals 1,950,000", async () => {
          const newCap = await Tron_Pool_Comptroller.supplyCaps(VUSDD_Tron);
          expect(newCap).to.equal(parseUnits("1950000", 18));
        });

        it("borrow cap of BTT equals 565,000,000,000", async () => {
          const newCap = await Tron_Pool_Comptroller.borrowCaps(VBTT_Tron);
          expect(newCap).to.equal(parseUnits("565000000000", 18));
        });

        it("borrow cap of WIN equals 1,150,000,000", async () => {
          const newCap = await Tron_Pool_Comptroller.borrowCaps(VWIN_Tron);
          expect(newCap).to.equal(parseUnits("1150000000", 18));
        });

        it("borrow cap of TRX equals 3,150,000", async () => {
          const newCap = await Tron_Pool_Comptroller.borrowCaps(VTRX_Tron);
          expect(newCap).to.equal(parseUnits("3150000", 6));
        });

        it("borrow cap of USDT equals 920,000", async () => {
          const newCap = await Tron_Pool_Comptroller.borrowCaps(VUSDT_Tron);
          expect(newCap).to.equal(parseUnits("920000", 18));
        });

        it("borrow cap of USDD equals 1,300,000", async () => {
          const newCap = await Tron_Pool_Comptroller.borrowCaps(VUSDD_Tron);
          expect(newCap).to.equal(parseUnits("1300000", 18));
        });

        it("collateral factor of BTT equals 40%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VBTT_Tron)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.40", 18));
        });

        it("liquidation threshold of BTT equals 50%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VBTT_Tron)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.50", 18));
        });

        it("collateral factor of WIN equals 40%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VWIN_Tron)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.40", 18));
        });

        it("liquidation threshold of WIN equals 50%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VWIN_Tron)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.50", 18));
        });

        it("collateral factor of TRX equals 40%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VTRX_Tron)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.40", 18));
        });

        it("liquidation threshold of TRX equals 50%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VTRX_Tron)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.50", 18));
        });

        it("collateral factor of USDT equals 75%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VUSDT_Tron)).collateralFactorMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.75", 18));
        });

        it("liquidation threshold of USDT equals 80%", async () => {
          const collateralFactor = (await Tron_Pool_Comptroller.markets(VUSDT_Tron)).liquidationThresholdMantissa;
          expect(collateralFactor).to.equal(parseUnits("0.80", 18));
        });
      });

      describe("Interest Rate Model", async () => {
        it("Address Checks", async () => {
          let rateModel = await vUSDT_Tron.interestRateModel();
          expect(rateModel).to.equal(vUSDT_Tron_Rate_Model);

          rateModel = await vUSDD_Tron.interestRateModel();
          expect(rateModel).to.equal(vUSDD_Tron_Rate_Model);
        });

        it("USDT Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDT_Tron_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });

        it("USDD Parameters Check", async () => {
          rateModel = new ethers.Contract(vUSDD_Tron_Rate_Model, RATE_MODEL_ABI, ethers.provider);
          expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
          expect(await rateModel.kink()).to.equal(parseUnits("0.7", 18));
          expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.1", 18)));
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
        });
      });
    });
  });
});
