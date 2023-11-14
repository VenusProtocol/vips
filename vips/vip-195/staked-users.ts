const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const users = {
  "0x07cf6eb791b038ecc157a81738b865154579c911": 1674970497,
};

const addresses: any = [];
const stakedAt: any = [];

const buildList = () => {
  for (const address in users) {
    addresses.push(address);
    stakedAt.push(users[address]);
  }
};

buildList();

export default {
  target: PRIME,
  signature: "setStakedAt(address[],uint256[])",
  params: [addresses, stakedAt],
};
