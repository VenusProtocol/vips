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
    assetAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    price: "1.0004157",
    assetAddress: "0x55d398326f99059fF775485246999027B3197955",
    feed: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    price: "1.00013349",
    assetAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    feed: "0xcbb98864ef56e9042e7d2efef76141f15731b82f",
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    price: "313.2",
    assetAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
  },
  {
    name: "vBNB",
    address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    price: "28171.26846352",
    assetAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    feed: "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf",
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    price: "1878.6849",
    assetAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
  },
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    price: "91.4",
    assetAddress: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    feed: "0x74e72f37a8c415c8f1a98ed42e78ff997435791d",
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    price: "0.50599826",
    assetAddress: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    feed: "0x93a67d414896a280bf8ffb3b389fe3686e014fda",
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    price: "127.09374798",
    assetAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    feed: "0x43d80f616daf0b0b42a928eed32147dc59027d41",
  },
  {
    name: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    price: "6.3763",
    assetAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    feed: "0xc333eb0086309a16aa7c8308dfd32c8bba0a2592",
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    price: "7.288",
    assetAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    feed: "0xca236e327f629f9fc2c30a4e95775ebf0b89fac8",
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    price: "0.99987",
    assetAddress: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    feed: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    price: "5.6139",
    assetAddress: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    feed: "0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83",
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    price: "1855.657809",
    assetAddress: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    feed: "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782",
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    price: "0.38441773",
    assetAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    feed: "0xa767f745331D267c7751297D982b050c93985627",
  },
  {
    name: "vTUSD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
    price: "902379100",
    assetAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    feed: "0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8",
  },
  {
    name: "vTRX",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    price: "1.121",
    assetAddress: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    feed: "0x7ca57b0ca6367191c94c8914d7df09a57655905f",
  },
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    price: "3.66796517",
    assetAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    feed: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
  },
];

forking(28927007, () => {
  const provider = ethers.provider;

  // describe("Pre-VIP behavior", async () => {
  //   let priceOracle: ethers.Contract;

  //   before(async () => {
  //     priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider);
  //     await setMaxStalePeriodInOracle(COMPTROLLER);
  //   });

  //   it("validate vToken prices", async () => {
  //     for (let i = 0; i < vTokens.length; i++) {
  //       const vToken = vTokens[i];
  //       const price = await priceOracle.getUnderlyingPrice(vToken.address);

  //       console.log(vToken.name, parseUnits(vToken.price, 18))
  //       // expect(price).to.be.equal(parseUnits(vToken.price, 18));
  //     }
  //   });
  // });

  testVip("VIP-107 Change Oracle and Configure Resilient Oracle", vip107Testnet(), {
    callbackAfterExecution: async txResponse => {
      // await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);

      // await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);

      // await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewPriceOracle"], [1]);
    },
  });

  // describe("Post-VIP behavior", async () => {
  //   let resilientOracle: ethers.Contract;
  //   let comptroller: ethers.Contract;

  //   before(async () => {
  //     comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  //     resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

  //     for (let i = 0; i < vTokens.length; i++) {
  //       const vToken = vTokens[i];
  //       await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, NORMAL_TIMELOCK);
  //     }
  //   });

  //   it("validate vToken prices", async () => {
  //     for (let i = 0; i < vTokens.length; i++) {
  //       const vToken = vTokens[i];
  //       const price = await resilientOracle.getUnderlyingPrice(vToken.address);
  //       expect(price).to.be.equal(parseUnits(vToken.price, 18));
  //     }
  //   });
  // });
});
