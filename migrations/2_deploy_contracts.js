/*const Migrations = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};*/

const Migrations = artifacts.require("USM_Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
