import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriodInChainlinkOracle, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip106 } from "../../vips/vip-106";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const CHAINLINK_ORACLE = "0x672Ba3b2f5d9c36F36309BA913D708C4a5a25eb0";
const RESILIENT_ORACLE = "0xe40C7548bFB764C48f9A037753A9F08c5B3Fde15";
const PRICE_ORACLE = "0x7FabdD617200C9CB4dcf3dd2C41273e60552068A";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

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
    address: "0xeca88125a5adbe82614ffc12d0db554e2e2867c8",
    price: "0.999769",
    assetAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163"
  },
  {
    name: "vUSDT",
    address: "0xfd5840cd36d94d7229439859c0112a4185bc0255",
    price: "1.0004157",
    assetAddress: "0x55d398326f99059fF775485246999027B3197955",
    feed: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
  },
  {
    name: "vBUSD",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    price: "1.00013349",
    assetAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    feed: "0xcbb98864ef56e9042e7d2efef76141f15731b82f",
  },
  {
    name: "vSXP",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    price: "0.75894802",
    assetAddress: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    feed: "0xe188a9875af525d25334d75f3327863b2b8cd0f1",
  },
  {
    name: "vXVS",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    price: "4.82",
    assetAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    feed: "0xbf63f430a79d4036a5900c19818aff1fa710f206",
  },
  {
    name: "vBNB",
    address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    price: "313.2",
    assetAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
  },
  {
    name: "vBTC",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    price: "28171.26846352",
    assetAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    feed: "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf",
  },
  {
    name: "vETH",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    price: "1878.6849",
    assetAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
  },
  {
    name: "vLTC",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    price: "91.4",
    assetAddress: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    feed: "0x74e72f37a8c415c8f1a98ed42e78ff997435791d",
  },
  {
    name: "vXRP",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    price: "0.50599826",
    assetAddress: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    feed: "0x93a67d414896a280bf8ffb3b389fe3686e014fda",
  },
  {
    name: "vBCH",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    price: "127.09374798",
    assetAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    feed: "0x43d80f616daf0b0b42a928eed32147dc59027d41",
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57b33a5b184c806ad217",
    price: "6.3763",
    assetAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    feed: "0xc333eb0086309a16aa7c8308dfd32c8bba0a2592",
  },
  {
    name: "vLINK",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    price: "7.288",
    assetAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    feed: "0xca236e327f629f9fc2c30a4e95775ebf0b89fac8",
  },
  {
    name: "vDAI",
    address: "0x334b3ecb4dca3593bccc3c7ebd1a1c1d1780fbf1",
    price: "0.99987",
    assetAddress: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    feed: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
  },
  {
    name: "vFIL",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    price: "5.6139",
    assetAddress: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    feed: "0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83",
  },
  {
    name: "vBETH",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    price: "1855.657809",
    assetAddress: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    feed: "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782",
  },
  {
    name: "vADA",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    price: "0.38441773",
    assetAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    feed: "0xa767f745331D267c7751297D982b050c93985627",
  },
  {
    name: "vDOGE",
    address: "0xec3422ef92b2fb59e84c8b02ba73f1fe84ed8d71",
    price: "902379100",
    assetAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    feed: "0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8",
  },
  {
    name: "vMATIC",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    price: "1.121",
    assetAddress: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    feed: "0x7ca57b0ca6367191c94c8914d7df09a57655905f",
  },
  {
    name: "vCAKE",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    price: "3.66796517",
    assetAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    feed: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
  },
  {
    name: "vAAVE",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    price: "79.25683356",
    assetAddress: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    feed: "0xa8357bf572460fc40f4b0acacbb2a6a61c89f475",
  },
  {
    name: "vTUSD",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    price: "1.00032432",
    assetAddress: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    feed: "0xa3334a9762090e827413a7495afece76f41dfc06",
  },
  {
    name: "vTRX",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    price: "0.06646645",
    assetAddress: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "vTRX",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    price: "66466450000",
    assetAddress: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "VAI",
    address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    price: "0.96847512",
    assetAddress: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    feed: "0x058316f8Bb13aCD442ee7A216C7b60CFB4Ea1B53",
  },
];

forking(27116217, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let priceOracle: ethers.Contract;

    before(async () => {
      priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider);
      await setMaxStalePeriodInOracle(COMPTROLLER);
    })

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await priceOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });

  testVip("VIP-106 Change Oracle and Configure Resilient Oracle", vip106());

  describe("Post-VIP behavior", async () => {
    let resilientOracle: ethers.Contract;

    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(
          CHAINLINK_ORACLE,
          vToken.assetAddress,
          vToken.feed,
          NORMAL_TIMELOCK
        )
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
