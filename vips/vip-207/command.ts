import users from "./users";

const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

const buildList = () => {
  const finalUsers = {
    ...users.stakeNoClaimableUsers,
    ...users.stakeClaimableUsers,
    ...users.unstakeUsers,
  };

  const addresses: string[] = [];
  const stakedAt: number[] = [];
  for (const address in finalUsers) {
    addresses.push(address);
    stakedAt.push(finalUsers[address as keyof typeof finalUsers]);
  }

  return [addresses, stakedAt];
};

export default {
  target: PRIME,
  signature: "setStakedAt(address[],uint256[])",
  params: buildList(),
};
