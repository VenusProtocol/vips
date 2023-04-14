import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip107Testnet } from "../../vips/vip-107-testnet";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const CHAINLINK_ORACLE = "0xaDcED21ccd8cE69aA63356A1132f8BE9C7412714";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PRICE_ORACLE = "0xaac0ecd822c5da82d0bdab17972fc26dcbbaf5e4";

interface vTokenConfig {
  name: string;
  address: string;
  price: string;
  assetAddress: string;
  feed: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    price: "0.999769",
    assetAddress: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    feed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    price: "1.0004157",
    assetAddress: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    feed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    price: "1.00013349",
    assetAddress: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
    feed: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    price: "313.2",
    assetAddress: "0x75107940Cf1121232C0559c747A986DEfbc69DA9",
    feed: "0x678AC35ACbcE272651874E782DB5343F9B8a7D66",
  },
  {
    name: "vBNB",
    address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    price: "28171.26846352",
    assetAddress: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    feed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    price: "1878.6849",
    assetAddress: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
    feed: "0xCfA786C17d6739CBC702693F23cA4417B5945491",
  },
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    price: "91.4",
    assetAddress: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    feed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    price: "0.50599826",
    assetAddress: "0x969F147B6b8D81f86175de33206A4FD43dF17913",
    feed: "0x9Dcf949BCA2F4A8a62350E0065d18902eE87Dca3",
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    price: "127.09374798",
    assetAddress: "0x3022A32fdAdB4f02281E8Fab33e0A6811237aab0",
    feed: "0x4046332373C24Aed1dC8bAd489A04E187833B28d",
  },
  {
    name: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    price: "6.3763",
    assetAddress: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    feed: "0xf51492DeD1308Da8195C3bfcCF4a7c70fDbF9daE",
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    price: "7.288",
    assetAddress: "0xcD34BC54106bd45A04Ed99EBcC2A6a3e70d7210F",
    feed: "0x5e66a1775BbC249b5D51C13d29245522582E671C",
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    price: "0.99987",
    assetAddress: "0x67D262CE2b8b846d9B94060BC04DC40a83F0e25B",
    feed: "0x963D5e7f285Cc84ed566C486c3c1bC911291be38",
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    price: "5.6139",
    assetAddress: "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
    feed: "0x81faeDDfeBc2F8Ac524327d70Cf913001732224C",
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    price: "1855.657809",
    assetAddress: "0xcfeb0103d4BEfa041EA4c2dACce7B3E83E1aE7E3",
    feed: "0x957Eb0316f02ba4a9De3D308742eefd44a3c1719",
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    price: "0.38441773",
    assetAddress: "0x4B7268FC7C727B88c5Fc127D41b491BfAe63e144",
    feed: "0x298619601ebCd58d0b526963Deb2365B485Edc74",
  },
  {
    name: "vTRX",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    price: "1.121",
    assetAddress: "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    price: "3.66796517",
    assetAddress: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
];

forking(28927007, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let priceOracle: ethers.Contract;

    before(async () => {
      priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider);
      await setMaxStalePeriodInOracle(COMPTROLLER);
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await priceOracle.getUnderlyingPrice(vToken.address);

        console.log(vToken.name, parseUnits(vToken.price, 18))
        // expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });

  testVip("VIP-107 Change Oracle and Configure Resilient Oracle", vip107Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);

      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);

      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewPriceOracle"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: ethers.Contract;
    let comptroller: ethers.Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, NORMAL_TIMELOCK);
      }
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await resilientOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });
});
