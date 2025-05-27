import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip501, {
  BOUND_VALIDATOR,
  BOUND_VALIDATOR_IMPLEMENTATION,
  CHAINLINK_ORACLE,
  CHAINLINK_ORACLE_IMPLEMENTATION,
  DEFAULT_PROXY_ADMIN,
  REDSTONE_ORACLE,
  REDSTONE_ORACLE_IMPLEMENTATION,
  RESILIENT_ORACLE,
  RESILIENT_ORACLE_IMPLEMENTATION,
} from "../../vips/vip-501/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vBAL",
    address: "0xD4B82B7B7CdedB029e0E58AC1B6a04F6616BEd40",
    expectedPrice: parseUnits("2.5", 18),
  },
  {
    symbol: "vCRV",
    address: "0x121E3be152F283319310D807ed847E8b98319C1e",
    expectedPrice: parseUnits("0.5", 18),
  },
  {
    symbol: "vcrvUSD",
    address: "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082",
    expectedPrice: parseUnits("1", 18),
  },
  {
    symbol: "vDAI",
    address: "0xfe050f628bF5278aCfA1e7B13b59fF207e769235",
    expectedPrice: parseUnits("0.99994276", 18),
  },
  {
    symbol: "veBTC",
    address: "0x8E6241389e823111259413810b81a050bd45e5cE",
    expectedPrice: parseUnits("108610.7", 28),
  },
  {
    symbol: "vEIGEN",
    address: "0x6DB4aDbA8F144a57a397b57183BF619e957040B1",
    expectedPrice: parseUnits("3.5", 18),
  },
  {
    symbol: "vFRAX",
    address: "0x33942B932159A67E3274f54bC4082cbA4A704340",
    expectedPrice: parseUnits("1", 18),
  },
  {
    symbol: "vLBTC",
    address: "0x315F064cF5B5968fE1655436e1856F3ca558d395",
    expectedPrice: parseUnits("119471.77", 28),
  },
  {
    symbol: "vsFRAX",
    address: "0x18995825f033F33fa30CF59c117aD21ff6BdB48c",
    expectedPrice: parseUnits("1.041208475916013035", 18),
  },
  {
    symbol: "vsUSDS",
    address: "0x083a24648614df4b72EFD4e4C81141C044dBB253",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vTUSD",
    address: "0xE23A1fC1545F1b072308c846a38447b23d322Ee2",
    expectedPrice: parseUnits("1", 18),
  },
  {
    symbol: "vUSDC",
    address: "0xF87bceab8DD37489015B426bA931e08A4D787616",
    expectedPrice: parseUnits("0.99982329", 30),
  },
  {
    symbol: "vUSDS",
    address: "0x459C6a6036e2094d1764a9ca32939b9820b2C8e0",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vUSDT",
    address: "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
    expectedPrice: parseUnits("1", 30),
  },
  {
    symbol: "vWBTC",
    address: "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383",
    expectedPrice: parseUnits("108610.7", 28),
  },
  {
    symbol: "vWETH",
    address: "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9",
    expectedPrice: parseUnits("2554.05", 18),
  },
  {
    symbol: "vweETHs",
    address: "0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823",
    expectedPrice: parseUnits("2564.938990726718070063", 18),
  },
  {
    symbol: "vyvUSDC",
    address: "0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e",
    expectedPrice: parseUnits("0.99982329", 30),
  },
  {
    symbol: "vyvUSDT",
    address: "0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10",
    expectedPrice: parseUnits("1", 30),
  },
  {
    symbol: "vyvUSDS",
    address: "0x5e2fB6a1e1570eB61360E87Da44979cb932090B0",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vyvWETH",
    address: "0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2",
    expectedPrice: parseUnits("2554.05", 18),
  },
  {
    symbol: "vPT-sUSDE",
    address: "0x6c87587b1813eAf5571318E2139048b04eAaFf97",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vPT-USDe",
    address: "0xf2C00a9C3314f7997721253c49276c8531a30803",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vsUSDe",
    address: "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC",
    expectedPrice: parseUnits("1", 18),
  },
  {
    symbol: "vezETH",
    address: "0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A",
    expectedPrice: parseUnits("2554.05", 18),
  },
  {
    symbol: "vPT-weETH",
    address: "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1",
    expectedPrice: parseUnits("2434.650224212355208389", 18),
  },
  {
    symbol: "vpufETH",
    address: "0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356",
    expectedPrice: parseUnits("2554.05", 18),
  },
  {
    symbol: "vrsETH",
    address: "0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf",
    expectedPrice: parseUnits("2554.05", 18),
  },
  {
    symbol: "vsfrxETH",
    address: "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70",
    expectedPrice: parseUnits("3992.143011504793762803", 18),
  },
  {
    symbol: "vweETH",
    address: "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b",
    expectedPrice: parseUnits("2644.457545408881248592", 18),
  },
  {
    symbol: "vwstETH",
    address: "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D",
    expectedPrice: parseUnits("2554.05", 18),
  },
];

forking(8389479, async () => {
  const provider = ethers.provider;

  await impersonateAccount(sepolia.NORMAL_TIMELOCK);
  await setBalance(sepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip501", await vip501(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [17]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }

    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE)).to.equal(RESILIENT_ORACLE_IMPLEMENTATION);
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(CHAINLINK_ORACLE)).to.equal(CHAINLINK_ORACLE_IMPLEMENTATION);
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE)).to.equal(REDSTONE_ORACLE_IMPLEMENTATION);
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR)).to.equal(BOUND_VALIDATOR_IMPLEMENTATION);
      });
    });
  });
});
