import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip123Testnet } from "../../../vips/vip-123/vip-123-testnet";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCK_VTOKEN_ABI from "./abi/mockVToken.json";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PRICE_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";
const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";
const MOCK_VTOKEN = "0x65d77756974d3DA088F75DA527009c286F0228EE";

interface vTokenConfig {
  name: string;
  address: string;
  price: string;
  assetAddress: string;
  feed: string;
}

interface DirectVTokenConfig {
  name: string;
  address: string;
  price: string;
}

interface ILVTokenConfig {
  assetName: string;
  assetAddress: string;
  price: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    price: "1000017500000",
    assetAddress: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    feed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    price: "1000200000000",
    assetAddress: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    feed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    price: "0.99984159",
    assetAddress: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
    feed: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    price: "0.40084484",
    assetAddress: "0x75107940Cf1121232C0559c747A986DEfbc69DA9",
    feed: "0x678AC35ACbcE272651874E782DB5343F9B8a7D66",
  },
  {
    name: "vBNB",
    address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    price: "312.778175",
    assetAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    price: "4.90401369",
    assetAddress: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
    feed: "0xCfA786C17d6739CBC702693F23cA4417B5945491",
  },
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    price: "1902.18",
    assetAddress: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    feed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    price: "91.80206464",
    assetAddress: "0x969F147B6b8D81f86175de33206A4FD43dF17913",
    feed: "0x9Dcf949BCA2F4A8a62350E0065d18902eE87Dca3",
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    price: "0.501945",
    assetAddress: "0x3022A32fdAdB4f02281E8Fab33e0A6811237aab0",
    feed: "0x4046332373C24Aed1dC8bAd489A04E187833B28d",
  },
  {
    name: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    price: "27744.78472",
    assetAddress: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    feed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    price: "0.3791",
    assetAddress: "0xcD34BC54106bd45A04Ed99EBcC2A6a3e70d7210F",
    feed: "0x5e66a1775BbC249b5D51C13d29245522582E671C",
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    price: "726600000",
    assetAddress: "0x67D262CE2b8b846d9B94060BC04DC40a83F0e25B",
    feed: "0x963D5e7f285Cc84ed566C486c3c1bC911291be38",
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    price: "1.72404073",
    assetAddress: "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
    feed: "0x81faeDDfeBc2F8Ac524327d70Cf913001732224C",
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    price: "0.90445748",
    assetAddress: "0xcfeb0103d4BEfa041EA4c2dACce7B3E83E1aE7E3",
    feed: "0x957Eb0316f02ba4a9De3D308742eefd44a3c1719",
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    price: "67.13294623",
    assetAddress: "0x4B7268FC7C727B88c5Fc127D41b491BfAe63e144",
    feed: "0x298619601ebCd58d0b526963Deb2365B485Edc74",
  },
  {
    name: "vTRX",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    price: "0.0764325",
    assetAddress: "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    price: "76432500000",
    assetAddress: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
];

const directVTokens: DirectVTokenConfig[] = [
  {
    name: "vTUSD",
    address: "0x3a00d9b02781f47d033bad62edc55fbf8d083fb0",
    price: "1",
  },
];

const ilPoolTokens: ILVTokenConfig[] = [
  {
    assetName: "BIFI",
    assetAddress: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    price: "448.04805044",
  },
  {
    assetName: "BSW",
    assetAddress: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    price: "0.1671991",
  },
  {
    assetName: "ALPACA",
    assetAddress: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
    price: "0.2667",
  },
  {
    assetName: "WOO",
    assetAddress: "0x65B849A4Fc306AF413E341D44dF8482F963fBB91",
    price: "0.29290856",
  },
  {
    assetName: "FLOKI",
    assetAddress: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    price: "0.00003253",
  },
  {
    assetName: "BNBx",
    assetAddress: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    price: "342.50005266",
  },
  {
    assetName: "HAY",
    assetAddress: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    price: "1.00060712",
  },
  {
    assetName: "BTT",
    assetAddress: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    price: "0.0000006",
  },
  {
    assetName: "WIN",
    assetAddress: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    price: "0.00008508",
  },
  {
    assetName: "USDD",
    assetAddress: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    price: "1",
  },
  {
    assetName: "stkBNB",
    assetAddress: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    price: "328.36",
  },
  {
    assetName: "RACA",
    assetAddress: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    price: "0.0001901",
  },
  {
    assetName: "NFT",
    assetAddress: "0xc440e4F21AFc2C3bDBA1Af7D0E338ED35d3e25bA",
    price: "0.0000003665",
  },
  {
    assetName: "ankrBNB",
    assetAddress: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    price: "337.95",
  },
  {
    assetName: "ANKR",
    assetAddress: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    price: "0.03112",
  },
  {
    assetName: "WBNB",
    assetAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    price: "312.778175",
  },
];

forking(30247983, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let priceOracle: Contract;

    before(async () => {
      priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider);
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await priceOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }

      for (let i = 0; i < directVTokens.length; i++) {
        const vToken = directVTokens[i];
        const price = await priceOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });

  testVip("VIP-123 Change Oracle and Configure Resilient Oracle", await vip123Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [19]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [35]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewPriceOracle"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: Contract;
    let comptroller: Contract;
    let mockVToken: Contract;

    describe("Core Pool/IL VTokens", async () => {
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

    describe("IL VTokens", async () => {
      before(async () => {
        comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
        resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

        await impersonateAccount(DUMMY_SIGNER);
        mockVToken = new ethers.Contract(MOCK_VTOKEN, MOCK_VTOKEN_ABI, await ethers.getSigner(DUMMY_SIGNER));
      });

      it("validate IL vToken prices", async () => {
        for (let i = 0; i < ilPoolTokens.length; i++) {
          const vToken = ilPoolTokens[i];
          await mockVToken.setUnderlyingAsset(vToken.assetAddress);
          const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
          expect(price).to.be.equal(parseUnits(vToken.price, "18"));
        }
      });
    });
  });
});
