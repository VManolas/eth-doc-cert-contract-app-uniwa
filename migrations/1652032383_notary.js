// The code tells Truffle to obtain a reference to the Notary contract and deploy it.
var NotaryContract = artifacts.require("Notary");

module.exports = function(deployer) {

    deployer.deploy(NotaryContract);

};