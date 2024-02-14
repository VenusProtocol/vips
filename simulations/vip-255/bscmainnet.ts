import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriod } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { ADDRESSES_1 } from "../../vips/vip-238";
import { ADDRESSES_2 } from "../../vips/vip-239";
import { vip254 } from "../../vips/vip-254/bscmainnet";
import { PRIME, vip255 } from "../../vips/vip-255/bscmainnet";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import RESILIENT_ORACLE_ABI from "./abis/ResilientOracle.json";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

const ADDRESSES = [...ADDRESSES_1, ...ADDRESSES_2];

const PRIME_ASSET_ADDRESSES = [
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTC
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
  "0x55d398326f99059fF775485246999027B3197955", // USDT
];
const XVS_ADDRESS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

forking(36120958, () => {
  before(async () => {
    const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

    await Promise.all(
      [...PRIME_ASSET_ADDRESSES, XVS_ADDRESS].map(async assetAddress => {
        const assetContract = await ethers.getContractAt(ERC20_ABI, assetAddress);
        return setMaxStalePeriod(resilientOracle, assetContract);
      }),
    );

    await pretendExecutingVip(vip254());
  });

  testVip("VIP-240 Prime Program", vip255(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated", "Burn"], [1, 13]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;

    before(async () => {
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    describe("check if token minted", async () => {
      for (let i = 0; i < ADDRESSES.length; i++) {
        const address = ADDRESSES[i];
        it(`should burn minted token for ${address}`, async () => {
          const data = await prime.tokens(address);
          expect(data.exists).to.be.equal(false);
        });
      }
    });
  });
});
