# Ethereum Dev Guide Part 1

## TL;DR
### Develop the smart contract
Install [truffle](http://truffleframework.com/)
```
$npm install -g truffle
```
Initialize smart contract development project in a new directory
```
$truffle init
```
Use truffle to create a [solidity](https://solidity.readthedocs.io/en/develop/) source file `Notary.sol` in the `contracts/` directory with some scaffolding code
```
$truffle create contract Notary
```
File `Notary.sol` contains all the solidity code required for this application. Compile this code with truffle
```
$truffle compile
```
We will use [Ganache](http://truffleframework.com/ganache/) to deploy the contract onto an in-memory Ethereum blockchain simulator to test it. 
Use truffle to create a migration file for our Notary contract in the `migrations/` directory
```
$truffle create migration Notary
```
Add in the main configuration file `truffle.js` the code to tell truffle to look for an Ethereum node’s RPC interface on `port 7545` on `localhost` and,
deploy onto the network we find there, whatever the network id* *(Ethereum networks are identified by ids, with 1 being the oficial Ethereum main network)*

```
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    }
  }
};
```
Deploy the contract
```
truffle migrate --network development
```
Redeploy the contract (if/when needed)
```
truffle migrate --network development --reset
```
Connect to the blockchain using truffle's console mode, which provides a JS console with the [Web3 library](https://github.com/ethereum/web3.js/) and some further truffle extensions
```
truffle console
```
Truffle injects a Notary object with the contracts' Application Binary Interface (ABI) and its address. Use the injected object to create a reference to the deployed contract
```
let notary = await Notary.deployed()
```
Send a hash value of a file to the blockchain
```
notary.addDocHash("0x5abf61c361e5ef91582e70634dfbf2214fbdb6f29c949160b69f27ae947d919d");
```
Check if the hash value exists on the blockchain
```
notary.findDocHash("0x5abf61c361e5ef91582e70634dfbf2214fbdb6f29c949160b69f27ae947d919d");
```
Web3 uses the [BigNumber library](https://github.com/MikeMcl/bignumber.js/) and the result is an array with two objects of type BigNumber.

\* *Ganache is listening on this port (7545) by default. We have also named this deployment configuration development, so that we can add further networks with different names later on.*

### Develop a CLI
Create a subdirectory `cliapp`, initialise the project in it choosing `app.js` as an entry point
```
npm init
```
Install required library modules**
```
npm install web3 --save
npm install jssha --save
npm install command-line-args --save
```
Create a (contract wrapper) module to interact with the contract in the `cliapp` directory in `NotaryLib.js`
Create a contract wrapper module to write the command line tool in `app.js`
Store the hash value of a file
```
node cliapp/app.js -a <filename>
```
Verify a file's hash value
```
node cliapp/app.js -f <filename>
```

\*\* *[jsSHA](https://github.com/Caligatio/jsSHA) is a JS implementation of the SHA hashing algorithm family, whereas [command-line-args](https://www.npmjs.com/package/command-line-args) help work with command line arguments*

### Run an Ethereum node & deploy the contract
To test our contract on a real network, but without real money, we will use the Rinkeby test network.
[Install](https://geth.ethereum.org/docs/install-and-build/installing-geth) and [start geth](https://github.com/ethereum/go-ethereum)
```
geth --rinkeby --syncmode light --http --datadir=$HOME/rinkeby --allow-insecure-unlock
```
Until the node is fully synced, so it can be used for transactions,
in a different terminal, create and account
```
geth account new --datadir="$HOME/rinkeby/"
```
Request some Rinkeby test Ether credited to your account at the [Rinkeby faucet](https://faucet.rinkeby.io/).
While waiting for the node to catch up with the blockchain, connect to the interactive console of the running geth instance
```
geth attach ipc:/$HOME/rinkeby/geth.ipc
```
Query the node to see if it is still syncing (while true the node is still catching up)
```
eth.syncing
```
When syncing is complete, see the latest block number
```
eth.blockNumber
```
You can also see the list of your accounts
```
eth.accounts
```
To execute any transaction, unlock the account you are using
```
personal.unlockAccount("address", "password", 300) OR 
personal.unlockAccount(eth.accounts[0],"password", 300)
```
Once the node is in sync, and you have some Ether, add in `truffle-config.js` 
```
module.exports = {
  networks: {
    development: {
       host: "localhost",
       port: 7545,
       network_id: "*"
    },
    rinkeby: {
       host: "localhost",
       port: 8545,
       network_id: "4",
       gas: 4000000
    }
  }
};
```
Deploy the notary contract
```
truffle migrate --network rinkeby
```
Connect the CLI to the contract deployed on Rinkeby by editing `./cliapp/notaryLib.js`
- add the address of the deployed contract 
- connect to the port used by the node (default port for *geth*: `8545`) 
The CLI commands will now run on Rinkeby testnet network 
- Store the hash value of a file ```node cliapp/app.js -a <filename>```
- Verify a file's hash value ```node cliapp/app.js -f <filename>```

### Develop a web interface
Add `./webapp/index.html` and use the [bootstrap framework](https://getbootstrap.com/) and [jQuery library](https://jquery.com/).
Copy the `sha256.js` from [jsSHA library](https://github.com/Caligatio/jsSHA) and [web3 library](https://github.com/ChainSafe/web3.js#in-the-browser) into `./webapp/`.
Install globally [http-server](https://www.npmjs.com/package/http-server) (in case you do not have a local web server)
```
npm install http-server -g
```
Serve the web app on [localhost:8080](http://localhost:8080)
```
http-server .
```
Use the [MetaMask browser plugin](https://metamask.io/) and select Rinkeby as the network to connect to.

Define a contract wrapper module in `notaryWebLib.js` in the `webapp/` directory.


### Closing Notes
We have so far shown the process of developing an Ethereum smart contract based application, using document certification as a simple but useful example. We have developed and tested the contract locally, before deploying it to a real Ethereum blockchain. We have connected to the contract through our own Ethereum node and through MetaMask. Furthermore, we have used the web3 library to create a command-line interface and a web application.

Credits for this effort go to [Stefan Beyer](https://github.com/stbeyer) for his work on [docCertTutorial](https://github.com/stbeyer/docCertTutorial) back in January 2018(!)