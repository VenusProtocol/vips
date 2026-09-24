import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip619, { XVS_PROXY_OFT_SRC, remoteBridgeEntries } from "../../vips/vip-619/bscmainnet";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
// Binance 8 hot wallet: pure EOA holding ~1.76M XVS at the fork block.
const XVS_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// XVS in the BSC ResilientOracle has 3 oracles configured: main = Chainlink,
// pivot = Binance feed registry, fallback = RedStone. We promote RedStone
// to MAIN, disable pivot+fallback, and pin RedStone's `prices[XVS]` via
// `setDirectPrice` so `ResilientOracle.getPrice(XVS)` returns a stable value
// during the cap-enforcement tests. Returns the pinned USD18 price so callers
// can convert XVS amounts to USD without re-reading the oracle (the live feed
// path stays sensitive to staleness even after `setDirectPrice` is set).
const overrideXvsPriceOnBsc = async () => {
  const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));

  const redstone = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
  const xvsPrice = await redstone.getPrice(bscmainnet.XVS);
  await redstone.connect(timelock).setDirectPrice(bscmainnet.XVS, xvsPrice);

  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  await resilientOracle.connect(timelock).setTokenConfig({
    asset: bscmainnet.XVS,
    oracles: [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, false, false],
    cachingEnabled: false,
  });

  return xvsPrice;
};

forking(96883423, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let xvsPriceUsd18: BigNumberish;

  // Pin XVS price BEFORE the VIP runs — `testVip` advances time past timelock delays,
  // which pushes the fork past RedStone's staleness window. Reading `getPrice` after
  // that point reverts; setting `setDirectPrice` while the feed is still fresh keeps
  // the pinned value usable through post-VIP `sendFrom` calls.
  before(async () => {
    xvsPriceUsd18 = await overrideXvsPriceOnBsc();
  });

  beforeEach(async () => {
    bridge = new ethers.Contract(XVS_PROXY_OFT_SRC, XVS_BRIDGE_SRC_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    describe("Current bridge limits per remote chain", () => {
      for (const entry of remoteBridgeEntries) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId}) matches old limits`, async () => {
          expect(await bridge.chainIdToMaxDailyLimit(entry.dstLzChainId)).to.equal(entry.oldMaxDailyLimit);
          expect(await bridge.chainIdToMaxSingleTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxSingleTransactionLimit,
          );
          expect(await bridge.chainIdToMaxDailyReceiveLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxDailyReceiveLimit,
          );
          expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxSingleReceiveTransactionLimit,
          );
        });
      }
    });
  });

  testVip("VIP-619 Update XVS bridge limits on BSC", await vip619(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI],
        [
          "SetMaxDailyLimit",
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "SetMaxSingleReceiveTransactionLimit",
        ],
        [5, 5, 5, 5],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("New bridge limits per remote chain", () => {
      for (const entry of remoteBridgeEntries) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId}) matches new limits`, async () => {
          expect(await bridge.chainIdToMaxDailyLimit(entry.dstLzChainId)).to.equal(entry.newMaxDailyLimit);
          expect(await bridge.chainIdToMaxSingleTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxSingleTransactionLimit,
          );
          expect(await bridge.chainIdToMaxDailyReceiveLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxDailyReceiveLimit,
          );
          expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxSingleReceiveTransactionLimit,
          );
        });
      }
    });

    // Live `sendFrom` per affected route: tightened routes must succeed within the new cap;
    // disabled routes (single-tx cap == 0) must revert with "Single Transaction Limit Exceed".
    describe("`sendFrom` on affected routes: succeeds within lowered cap, reverts when over cap or route is disabled", () => {
      const disabledRoutes = remoteBridgeEntries.filter(entry => entry.newMaxSingleTransactionLimit.isZero());
      const tightenedRoutes = remoteBridgeEntries.filter(
        entry =>
          !entry.newMaxSingleTransactionLimit.eq(entry.oldMaxSingleTransactionLimit) &&
          !entry.newMaxSingleTransactionLimit.isZero(),
      );
      const affectedRoutes = [...tightenedRoutes, ...disabledRoutes];

      const SEND_AMOUNT = parseUnits("0.5", 18);
      const fees = new Map<number, BigNumberish>();
      const overCapAmounts = new Map<number, BigNumberish>();

      let xvs: Contract;
      let xvsHolderSigner: SignerWithAddress;
      let receiver: SignerWithAddress;
      let receiverAddressBytes32: string;
      let defaultAdapterParams: string;

      before(async () => {
        [receiver] = await ethers.getSigners();
        receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
        defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

        for (const entry of affectedRoutes) {
          const { nativeFee } = await bridge.estimateSendFee(
            entry.dstLzChainId,
            receiverAddressBytes32,
            SEND_AMOUNT,
            false,
            defaultAdapterParams,
          );
          fees.set(entry.dstLzChainId, nativeFee);
        }

        // For each tightened route, compute an XVS amount whose USD value sits just above the new cap.
        // Limits are USD18; oracle returns USD18 for an 18-decimal token, so amount * price / 1e18 = USD.
        // overCap = cap * 1e18 / price + 1 XVS adds a safe cushion past rounding. Price is captured
        // pre-VIP in the outer `before` since RedStone's feed is stale at this point in the run.
        for (const entry of tightenedRoutes) {
          const overCap = entry.newMaxSingleTransactionLimit
            .mul(parseUnits("1", 18))
            .div(xvsPriceUsd18)
            .add(parseUnits("1", 18));
          overCapAmounts.set(entry.dstLzChainId, overCap);
        }

        xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
        xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("10"));
        await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256);
      });

      for (const entry of tightenedRoutes) {
        it(`BSC → ${
          LzChainId[entry.dstLzChainId]
        }: sendFrom succeeds when outgoing amount is within the reduced single-transaction send limit`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          )
            .to.emit(bridge, "SendToChain")
            .withArgs(entry.dstLzChainId, XVS_HOLDER, receiverAddressBytes32, SEND_AMOUNT);
        });

        it(`BSC → ${
          LzChainId[entry.dstLzChainId]
        }: sendFrom reverts when outgoing amount exceeds the reduced single-transaction send limit`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                overCapAmounts.get(entry.dstLzChainId)!,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }

      for (const entry of disabledRoutes) {
        it(`BSC → ${
          LzChainId[entry.dstLzChainId]
        }: sendFrom reverts with "Single Transaction Limit Exceed" for any amount — outgoing single-transaction send limit reduced to 0 (route disabled)`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }
    });

    // Drain the daily outgoing send quota with repeated sends each just below the single-tx cap
    // (so every individual send passes the single-tx check). Once the quota is exhausted, verify
    // the next send reverts with "Daily Limit Exceed". Zeroed routes are excluded — drainAmount
    // cannot be computed when the single-tx cap is 0, and they are already covered above.
    describe("`sendFrom` daily outgoing send limit enforcement", () => {
      const routesWithDailyLimit = remoteBridgeEntries.filter(entry => !entry.newMaxDailyLimit.isZero());

      const fees = new Map<number, BigNumberish>();
      const drainAmounts = new Map<number, BigNumber>();

      let xvs: Contract;
      let xvsHolderSigner: SignerWithAddress;
      let receiver: SignerWithAddress;
      let receiverAddressBytes32: string;
      let defaultAdapterParams: string;

      before(async () => {
        [receiver] = await ethers.getSigners();
        receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
        defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

        xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
        xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("10"));
        await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256);

        for (const entry of routesWithDailyLimit) {
          // Each drain send must stay below the single-tx cap so it passes the single-tx check
          // while still counting toward the daily accumulator. Subtract 1 XVS as a rounding cushion.
          const drainAmount = entry.newMaxSingleTransactionLimit
            .mul(parseUnits("1", 18))
            .div(xvsPriceUsd18)
            .sub(parseUnits("1", 18));
          drainAmounts.set(entry.dstLzChainId, drainAmount);

          const { nativeFee } = await bridge.estimateSendFee(
            entry.dstLzChainId,
            receiverAddressBytes32,
            drainAmount,
            false,
            defaultAdapterParams,
          );
          fees.set(entry.dstLzChainId, nativeFee);
        }
      });

      for (const entry of routesWithDailyLimit) {
        it(`BSC → ${
          LzChainId[entry.dstLzChainId]
        }: sendFrom reverts with "Daily Limit Exceed" once the reduced daily outgoing send quota is exhausted`, async () => {
          const drainAmount = drainAmounts.get(entry.dstLzChainId)!;
          const fee = fees.get(entry.dstLzChainId)!;

          // drainAmount is 1 XVS below the single-tx cap, so floor(dailyCap / drainAmountUsd)
          // sends exhaust the quota while leaving less than one drainAmount of headroom — the
          // subsequent send then trips "Daily Limit Exceed". The tiny amount already accumulated
          // from earlier sends in this snapshot is absorbed by that same floor-division gap.
          const drainAmountUsd = drainAmount.mul(xvsPriceUsd18).div(parseUnits("1", 18));
          const txCount = entry.newMaxDailyLimit.div(drainAmountUsd).toNumber();

          // Send txCount transactions to drain the daily quota down to less than one drainAmount.
          for (let i = 0; i < txCount; i++) {
            await bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                drainAmount,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fee },
              );
          }

          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                drainAmount,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fee },
              ),
          ).to.be.revertedWith("Daily Transaction Limit Exceed");
        });
      }
    });

    // Mock test: impersonates the bridge itself to call nonblockingLzReceive directly (msg.sender == address(this)).
    // This bypasses the lzReceive → excessivelySafeCall wrapper so cap-check reverts propagate normally.
    describe("`nonblockingLzReceive` single-tx receive cap enforcement on tightened routes", () => {
      // 0.5 XVS — well within any new receive cap in USD terms
      const RECV_AMOUNT = parseUnits("0.5", 18);
      // 18 local decimals − 8 shared decimals
      const LD_TO_SD = parseUnits("1", 10);

      const receiveTightenedRoutes = remoteBridgeEntries.filter(
        e => e.dstLzChainId !== LzChainId.arbitrumone && e.dstLzChainId !== LzChainId.basemainnet,
      );

      const overCapReceiveAmounts = new Map<number, BigNumberish>();
      let bridgeSigner: SignerWithAddress;
      let recvRecipient: SignerWithAddress;
      let nonce = 100;

      before(async () => {
        [, , recvRecipient] = await ethers.getSigners();
        bridgeSigner = await initMainnetUser(bridge.address, ethers.utils.parseEther("2"));

        for (const entry of receiveTightenedRoutes) {
          const overCap = entry.newMaxSingleReceiveTransactionLimit
            .mul(parseUnits("1", 18))
            .div(xvsPriceUsd18)
            .add(parseUnits("1", 18));
          overCapReceiveAmounts.set(entry.dstLzChainId, overCap);
        }
      });

      for (const entry of receiveTightenedRoutes) {
        it(`${
          LzChainId[entry.dstLzChainId]
        } → BSC: succeeds when incoming amount is within the reduced single-transaction receive limit`, async () => {
          const payload = ethers.utils.solidityPack(
            ["uint8", "bytes32", "uint64"],
            [0, ethers.utils.hexZeroPad(recvRecipient.address, 32), RECV_AMOUNT.div(LD_TO_SD)],
          );
          await expect(bridge.connect(bridgeSigner).nonblockingLzReceive(entry.dstLzChainId, "0x", nonce++, payload))
            .to.emit(bridge, "ReceiveFromChain")
            .withArgs(entry.dstLzChainId, recvRecipient.address, RECV_AMOUNT);
        });

        it(`${
          LzChainId[entry.dstLzChainId]
        } → BSC: reverts when incoming amount exceeds the reduced single-transaction receive limit`, async () => {
          const overCap = overCapReceiveAmounts.get(entry.dstLzChainId)!;
          const amountSD = BigNumber.from(overCap).div(LD_TO_SD);
          const payload = ethers.utils.solidityPack(
            ["uint8", "bytes32", "uint64"],
            [0, ethers.utils.hexZeroPad(recvRecipient.address, 32), amountSD],
          );
          await expect(
            bridge.connect(bridgeSigner).nonblockingLzReceive(entry.dstLzChainId, "0x", nonce++, payload),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }
    });
  });
});
