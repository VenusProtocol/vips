import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriod } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip238 } from "../../vips/vip-238";
import { ADDRESSES_2, PRIME, vip239 } from "../../vips/vip-239";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import RESILIENT_ORACLE_ABI from "./abis/ResilientOracle.json";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

const PRIME_ASSET_ADDRESSES = [
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTC
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
  "0x55d398326f99059fF775485246999027B3197955", // USDT
];
const XVS_ADDRESS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

forking(35091518, () => {
  before(async () => {
    const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

    await Promise.all(
      [...PRIME_ASSET_ADDRESSES, XVS_ADDRESS].map(async assetAddress => {
        const assetContract = await ethers.getContractAt(ERC20_ABI, assetAddress);
        return setMaxStalePeriod(resilientOracle, assetContract);
      }),
    );
  });

  testVip("VIP-238 Prime Program (1/2)", vip238());

  testVip("VIP-239 Prime Program (2/2)", vip239(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_ABI], ["Mint"], [13]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;

    before(async () => {
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    describe("check if token minted", async () => {
      for (let i = 0; i < ADDRESSES_2.length; i++) {
        const address = ADDRESSES_2[i];
        it(`should have minted token for ${address}`, async () => {
          const data = await prime.tokens(address);
          expect(data.exists).to.be.equal(true);
        });
      }
    });
  });
});
