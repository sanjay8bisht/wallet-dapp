const Transfer = artifacts.require("../contracts/Transfer.sol");

module.exports = function (deployer) {
  deployer.deploy(Transfer);
};
