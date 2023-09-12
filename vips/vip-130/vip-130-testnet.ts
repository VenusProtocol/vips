import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// Core pool: 0x94d1820b2D1c7c7452A163983Dc888CEC546b77D
// swapRouter core pool = "0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0";

// IL pool: 0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B
// swapRouter IL = "0xCA59D9e8889Bc6034CCD749c4Ddd09c865432bA8";

// Addresses of all the swapRouters
export const swapRouters = ["0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0", "0xCA59D9e8889Bc6034CCD749c4Ddd09c865432bA8"];

export const vip130Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-130 Accepting ownership for swap routers",
    description: `Swap routers are deployed for each pool including the core pool and one isolated pool,
      and the ownership of these routers is transferred to Timelock and this VIP is to accept the ownership of all
      the swap routers.`,
    forDescription: "I agree that Venus Protocol should proceed with accepting ownership for swap routers",
    againstDescription: "I do not think that Venus Protocol should proceed with accepting ownership for swap routers",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with accepting ownership for swap routers or not",
  };

  return makeProposal(
    swapRouters.map(router => ({
      target: router,
      signature: "acceptOwnership()",
      params: [],
    })),
    meta,
    ProposalType.REGULAR,
  );
};
