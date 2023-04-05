import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip105 } from "../../vips/vip-105";
import IERC20 from "./abi/IERC20UpgradableAbi.json";

const RECEIVER_WALLET = "0x9Fc58be64B3E984F4f0e440d8baeF35a619BDD79";

const EXPECTED_BALANCES = [
  {
    symbol: "USDC",
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    expectedDelta: parseUnits("84336.774429353289132901", 18),
  },
  {
    symbol: "USDT",
    token: "0x55d398326f99059fF775485246999027B3197955",
    expectedDelta: parseUnits("224216.402358002557109511", 18),
  },
  {
    symbol: "BUSD",
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    expectedDelta: parseUnits("149766.292905908491401483", 18),
  },
  {
    symbol: "SXP",
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    expectedDelta: parseUnits("4226.170049572293389755", 18),
  },
  {
    symbol: "BTCB",
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    expectedDelta: parseUnits("2.139518782543482199", 18),
  },
  {
    symbol: "ETH",
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    expectedDelta: parseUnits("36.304055128368749225", 18),
  },
  {
    symbol: "LTC",
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    expectedDelta: parseUnits("9.783416297561617289", 18),
  },
  {
    symbol: "XRP",
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    expectedDelta: parseUnits("2415.207523376445505034", 18),
  },
  {
    symbol: "BCH",
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    expectedDelta: parseUnits("16.122080702750609219", 18),
  },
  {
    symbol: "DOT",
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    expectedDelta: parseUnits("1700.553506439618646265", 18),
  },
  {
    symbol: "LINK",
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    expectedDelta: parseUnits("150.10794683218436306", 18),
  },
  {
    symbol: "DAI",
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    expectedDelta: parseUnits("5963.131131552787288367", 18),
  },
  {
    symbol: "FIL",
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    expectedDelta: parseUnits("326.979299181248597022", 18),
  },
  {
    symbol: "BETH",
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    expectedDelta: parseUnits("3.966683770419111307", 18),
  },
  {
    symbol: "ADA",
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    expectedDelta: parseUnits("10933.590555868063802872", 18),
  },
  {
    symbol: "DOGE",
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    expectedDelta: parseUnits("22049.95732868", 8),
  },
  {
    symbol: "MATIC",
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    expectedDelta: parseUnits("2153.980419540478799446", 18),
  },
  {
    symbol: "Cake",
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    expectedDelta: parseUnits("33454.764029306602354035", 18),
  },
  {
    symbol: "AAVE",
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    expectedDelta: parseUnits("16.646811666163423623", 18),
  },
  {
    symbol: "TUSD",
    token: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    expectedDelta: parseUnits("8238.214428010506197901", 18),
  },
  {
    symbol: "TRXOLD",
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    expectedDelta: parseUnits("38794.912745102631523699", 18),
  },
  {
    symbol: "TRX",
    token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    expectedDelta: parseUnits("1823.275038", 6),
  },
  {
    symbol: "vUSDC",
    token: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    expectedDelta: parseUnits("2257290.48631489", 8),
  },
  {
    symbol: "vUSDT",
    token: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    expectedDelta: parseUnits("1884442.15527482", 8),
  },
  {
    symbol: "vBUSD",
    token: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    expectedDelta: parseUnits("2600922.62152664", 8),
  },
  {
    symbol: "vSXP",
    token: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    expectedDelta: parseUnits("1188439.52271164", 8),
  },
  {
    symbol: "vXVS",
    token: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    expectedDelta: parseUnits("49717.23348212", 8),
  },
  {
    symbol: "vBNB",
    token: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    expectedDelta: parseUnits("971.84003721", 8),
  },
  {
    symbol: "vBTC",
    token: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    expectedDelta: parseUnits("506.12356567", 8),
  },
  {
    symbol: "vETH",
    token: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    expectedDelta: parseUnits("367.80883069", 8),
  },
  {
    symbol: "vLTC",
    token: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    expectedDelta: parseUnits("6422.52508056", 8),
  },
  {
    symbol: "vXRP",
    token: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    expectedDelta: parseUnits("135776.05714127", 8),
  },
  {
    symbol: "vBCH",
    token: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    expectedDelta: parseUnits(".92643697", 8),
  },
  {
    symbol: "vDOT",
    token: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    expectedDelta: parseUnits("3179.54051793", 8),
  },
  {
    symbol: "vLINK",
    token: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    expectedDelta: parseUnits("3554.61987974", 8),
  },
  {
    symbol: "vDAI",
    token: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    expectedDelta: parseUnits("89146.06926431", 8),
  },
  {
    symbol: "vFIL",
    token: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    expectedDelta: parseUnits("8337.01765444", 8),
  },
  {
    symbol: "vBETH",
    token: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    expectedDelta: parseUnits("3.67712901", 8),
  },
  {
    symbol: "vADA",
    token: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    expectedDelta: parseUnits("64909.22366446", 8),
  },
  {
    symbol: "vDOGE",
    token: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    expectedDelta: parseUnits("1141977.45077479", 8),
  },
  {
    symbol: "vMATIC",
    token: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    expectedDelta: parseUnits("5434.83113915", 8),
  },
  {
    symbol: "vCAKE",
    token: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    expectedDelta: parseUnits("56195.27200979", 8),
  },
  {
    symbol: "vAAVE",
    token: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    expectedDelta: parseUnits("2.24629775", 8),
  },
  {
    symbol: "vTRXOLD",
    token: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    expectedDelta: parseUnits("184214.47596914", 8),
  },
  {
    symbol: "vTRX",
    token: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    expectedDelta: parseUnits("2028.17090061", 8),
  },
];

const ORIGINAL_BALANCES: { [address: string]: BigNumber } = {
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8": parseUnits("1437.5", 18),
  "0xA07c5b74C9B40447a954e1466938b865b6BBea36": parseUnits("50574.61114717", 8),
};

forking(27082000, () => {
  describe("Pre-VIP balances", async () => {
    it("should have the correct balance for ETH", async () => {
      const token = await ethers.getContractAt(IERC20, "0x2170Ed0880ac9A755fd29B2688956BD959F933F8");
      const balance = await token.balanceOf(RECEIVER_WALLET);
      expect(balance).to.equal(ORIGINAL_BALANCES["0x2170Ed0880ac9A755fd29B2688956BD959F933F8"]);
    });

    it("should have the correct balance for vBNB", async () => {
      const token = await ethers.getContractAt(IERC20, "0xA07c5b74C9B40447a954e1466938b865b6BBea36");
      const balance = await token.balanceOf(RECEIVER_WALLET);
      expect(balance).to.equal(ORIGINAL_BALANCES["0xA07c5b74C9B40447a954e1466938b865b6BBea36"]);
    });
  });

  testVip("VIP-105", vip105());

  describe("Post-VIP balances", async () => {
    it("should have the correct balance for BNB", async () => {
      const balance = await ethers.provider.getBalance(RECEIVER_WALLET);
      expect(balance).to.equal(parseEther("2865.040389940043904933"));
    });

    EXPECTED_BALANCES.forEach(({ symbol, token, expectedDelta }) => {
      it(`should have the correct balance for ${symbol}`, async () => {
        const erc20 = await ethers.getContractAt(IERC20, token);
        const balance = await erc20.balanceOf(RECEIVER_WALLET);
        let expectedBalance = expectedDelta;
        if (ORIGINAL_BALANCES[token]) {
          expectedBalance = expectedDelta.add(ORIGINAL_BALANCES[token]);
        }
        expect(balance).to.equal(expectedBalance);
      });
    });
  });
});
