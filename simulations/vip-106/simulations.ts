import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip106 } from "../../vips/vip-106";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const CHAINLINK_ORACLE = "0x672Ba3b2f5d9c36F36309BA913D708C4a5a25eb0";
const RESILIENT_ORACLE = "0xe40C7548bFB764C48f9A037753A9F08c5B3Fde15";
const PRICE_ORACLE = "0x7FabdD617200C9CB4dcf3dd2C41273e60552068A";

interface vTokenConfig {
  name: string;
  address: string;
  price: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    address: "0xeca88125a5adbe82614ffc12d0db554e2e2867c8",
    price: "0.999769"
  },
  {
    name: "vUSDT",
    address: "0xfd5840cd36d94d7229439859c0112a4185bc0255",
    price: "1.0004157"
  },
  {
    name: "vBUSD",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    price: "1.00013349"
  },
  {
    name: "vSXP",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    price: "0.75894802"
  },
  {
    name: "vXVS",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    price: "4.82"
  },
  {
    name: "vBNB",
    address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    price: "313.2"
  },
  {
    name: "vBTC",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    price: "28171.26846352"
  },
  {
    name: "vETH",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    price: "1878.6849"
  },
  {
    name: "vLTC",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    price: "91.4"
  },
  {
    name: "vXRP",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    price: "0.50599826"
  },
  {
    name: "vBCH",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    price: "127.09374798"
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57b33a5b184c806ad217",
    price: "6.3763"
  },
  {
    name: "vLINK",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    price: "7.288"
  },
  {
    name: "vDAI",
    address: "0x334b3ecb4dca3593bccc3c7ebd1a1c1d1780fbf1",
    price: "0.99987"
  },
  {
    name: "vFIL",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    price: "5.6139"
  },
  {
    name: "vBETH",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    price: "1855.657809"
  },
  {
    name: "vADA",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    price: "0.38441773"
  },
  {
    name: "vDOGE",
    address: "0xec3422ef92b2fb59e84c8b02ba73f1fe84ed8d71",
    price: "902379100"
  },
  {
    name: "vMATIC",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    price: "1.121"
  },
  {
    name: "vCAKE",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    price: "3.66796517"
  },
  {
    name: "vAAVE",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    price: "79.25683356"
  },
  {
    name: "vTUSD",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    price: "1.00032432"
  },
  {
    name: "vTRX",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    price: "0.06646645"
  },
  {
    name: "vTRX",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    price: "66466450000"
  },
  {
    name: "VAI",
    address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    price: "0.96847512"
  },
]

forking(27116217, () => {
  let comptroller: ethers.Contract;
  let chainlinkOracle: ethers.Contract;
  let resilientOracle: ethers.Contract;
  let priceOracle: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider)
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i]
        const price = (await priceOracle.getUnderlyingPrice(vToken.address));
        expect(price).to.be.equal(parseUnits(vToken.price, 18))
      }
    });
  });

  testVip("VIP-106 Change Oracle and Configure Resilient Oracle", vip106());

  describe("Post-VIP behavior", async () => {
    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i]
        const price = (await chainlinkOracle.getUnderlyingPrice(vToken.address));
        expect(price).to.be.equal(parseUnits(vToken.price, 18))
      }
    });
  })
});
