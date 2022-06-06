# Ethereum Dev Guide Part 1

## Introduction with Document certification

**Document certification**, also known as **time-stamping** or **proof of existence**,
-   is one of the most obvious use cases for blockchain technology (beyond digital currencies).
-   consists in saving a **tamper-proof timestamped fingerprint** of a document (or binary file) on the blockchain,
    -   which basically serves as proof that the document existed in a certain version at a certain time and can be used to prove integrity of the file.
    -   That is, you can prove that a document has not been modified since its certification.
    -   Use cases cover registering private contracts, protecting copyright, sealing log files and any other case where file integrity is important.

In this introduction we will look at how
-   to create an Ethereum contract that allows to store data on the blockchain, and
-   to read it, by using document certification as an example.

To do so, we will
-   create a simple smart contract that saves:
    -   a [SHA-256 hash](https://en.wikipedia.org/wiki/SHA-2)* of a file on the blockchain,
    -   together with a timestamp.

\**SHA-256 hashes uniquely identify sets of data by means of a cryptographic hash function. We will not go into detail on hash functions and cryptography here, but you should remember that a SHA-256 hash is a 32-byte fingerprint derived from the input data. The reverse operation, i.e. calculating the data from the hash value, is not feasible, so data protection is a welcome side-effect.*

### Developing the smart contract

We will use the [Solidity](https://solidity.readthedocs.io/en/develop/) programming language to write our contract and the [Truffle framework](http://truffleframework.com/) to ease development.

### Testing the contract

It is recommended to avoid deploying a contract onto a real network without prior testing. To test our contract we will deploy it onto an in-memory Ethereum blockchain simulator, using using the [Ganache](http://truffleframework.com/ganache/) tool for testing. We will deploy our contract onto the test blockchain, using truffle to first create a migration file for our _Notary_ contract: `truffle create migration Notary`
This will create a new Javascript file in the _migrations_ directory with some scaffolding code.
Before we can execute this code and proceed with the actual deployment, we have to configure Truffle to use our local test blockchain** for deployment. To do so we need to edit the file **_truffle.js_** (or truffle-config.js) which is the main configuration file.

Now we can deploy the contract by typing: `truffle migrate --network development`

During development we might fix some bugs and redeploy. To do a re-deploy we have to add a reset option: `truffle migrate --network development --reset`

\*\**It is not actually necessary to explicitly specify the network, as truffle will deploy to the first network on the list. However, it is good practice to do so, in order to avoid mistakes later on.*

Note, that we have automatically deployed the truffle supplied _Migrations_ contract as well. This is used by Truffle for **migration tasks** and we will leave it alone.
You could also check the address each contract is assigned to.

We now have a version of our contract on our local blockchain simulator and we can interact with it.

There are various **ways to test a contract** and Truffle actually ships with a sophisticated test framework, but for now we will connect to our blockchain using Truffle’s console mode, which provides a Javascript console with the [Web3](https://github.com/ethereum/web3.js/) library and some further Truffle extensions. The Web3 library provides a standard Javascript interface to allow applications to communicate with the blockchain.
Type: `truffle console` to enter console mode and receive a Javascript command prompt.

Truffle makes life easy by injecting a _Notary_ object with some important fields, such as
-   the contract's **Application Binary Interface (ABI)** and
-   its **address**.
These are two details you need to know of any contact you wish to interact with on the blockchain.

We can use the injected object to create a reference to our deployed contract: `let notary = await Notary.deployed()`
We can now send a hash value of a file to the blockchain.

_As we have not implemented a client which calculates hash values yet, we can either send any integer number for testing purposes or use openssl or any other tool you have installed locally to generate a SHA-256 hash of a file._
_Alternatively we can just use the value in the example below, using the following code in the Truffle console:_
`notary.addDocHash("0x5abf61c361e5ef91582e70634dfbf2214fbdb6f29c949160b69f27ae947d919d");`
_Note that we are passing a string datatype as an argument._
_As long as we format the string correctly with a leading `0x` to indicate a hexadecimal value, the web3 library translates this correctly to our contract’s ABI._

On return, you should be presented with a receipt of your transaction, including
    -   a transaction id,
    -   some information on the block the transaction has been mined in, and
    -   the gas used.
_Note, that in our testing environment the transaction is mined instantly. Using a real Ethereum network things would be considerably slower and testing would be cumbersome._

We can use the findDocHash function to check wether our hash value exists on the blockchain:
`notary.findDocHash("0x5abf61c361e5ef91582e70634dfbf2214fbdb6f29c949160b69f27ae947d919d");`

The result is an array with two objects of type _BigNumber_.

Web3 uses the [_BigNumber_](https://github.com/MikeMcl/bignumber.js/)_ library, as Javascript is notoriously bad at dealing with large numbers. _We could use the library to decode these values properly, but it is easy to see that the first element of the array corresponds to our first return value, the timestamp, and the second element to the block number._

You may try repeating the call with a hash value which we have not saved onto the blockchain to get two zero values as return values.

Having done the above, we have, so far, shown that our contract works correctly.
Now, we are going to develop a **command line tool** that interacts with the contract, and, also, we are going to **deploy** the contract onto the **Ethereum test network**.

### Developing a CLI

First let's start up Ganache again and use Truffle to deploy the contract on it. Make a note of the contract address.

Create a subdirectory named `cliapp` 
Enter the directory and initialize the project: `npm init`
Choose `app.js` as an entry point.

Next, install some required library modules:

    npm install web3 --save
    npm install jssha --save
    npm install command-line-args --save

The [web3 library](https://github.com/ethereum/web3.js/) will be used to connect to our Ethereum node’s RPC interface and communicate with the contract.
[jsSHA](https://github.com/Caligatio/jsSHA) is a Javascript implementation of the SHA hashing algorithm family.
[command-line-args](https://www.npmjs.com/package/command-line-args) will help us to work with command line arguments.

In the `cliapp/` directory:
-   create a (contract wrapper) module to interact with our contract: `notaryLib.js`
-   use a contract wrapper module to write our command line tool: `app.js`

We can store the hash value of a file by typing\*: `node cliapp/app.js -a <filename>`
Similarly, we can verify a file's hash value using: `node cliapp/app.js -f <filename>`

### Running an Ethereum node

To deploy a contract to a network (on an Ethereum blockchain), we need to run some Ethereum node software.
_There are a few options to run your own Ethereum node, for example:_
-   downloading the official [_Ethereum wallet_](https://www.ethereum.org/),
-   using the underlying [**_geth_**](https://github.com/ethereum/go-ethereum)** _command line node_** without graphical user interface, or
-   using alternative software, such as [_Parity_](https://www.parity.io/). 

We will will use the [official **geth** reference implementation](https://geth.ethereum.org/):
-   _download the software from the Ethereum web site at_ [https://www.ethereum.org/cli](https://www.ethereum.org/cli)
-   _follow the instructions for your system._

_Additional info_: [https://geth.ethereum.org/downloads/](https://geth.ethereum.org/downloads/), [https://geth.ethereum.org/docs/install-and-build/installing-geth](https://geth.ethereum.org/docs/install-and-build/installing-geth), and also [_geth-ting started_](https://geth.ethereum.org/docs/getting-started).

There are several test networks available:
-   Rinkeby works only with geth and the official wallet (which uses geth below the hood),
-   Kovan works only with Parity, and
-   Ropsten works with both.
To test our contract we will use the **Rinkeby test network**, because it is more stable than Ropsten. 
_Test networks may suffer denial of service attacks, as the Ether involved does not have any real value, and Ropsten is more susceptible to this, because of the consensus algorithm used._

Starting **geth** to:
-   connect to `Rinkeby`
-   use the `fast` synchronization mode _(which speeds up the initial blockchain download by not replaying the entire transaction history)_
-   enable RPC interface _(which we need to connect to the node programatically)_, and
-   store the blockchain data in a rinkeby sub-directory of our home directory _(to make sure we know where the data will be, as the default location varies between OS)_
`geth --rinkeby --syncmode light`~~`fast`~~` --http`~~`rpc`~~` --datadir=$HOME/rinkeby`\*\*

_Additional info_: [fast ⟶ light](https://geth.ethereum.org/docs/interface/command-line-options), [--rpc ⟶ --http](https://stackoverflow.com/questions/69463898/flag-provided-but-not-defined-rpc/69643321#69643321), and [more on runnig a light node](https://ethereum.org/en/developers/tutorials/run-light-node-geth/)

You can also add `--allow-insecure-unlock` to [allow unlock via HTTP-RPC](https://stackoverflow.com/questions/64822973/web3-http-access-is-forbidden-error-when-unlocking-account-over-https).

The node cannot be used for transactions until it is fully synced _(i.e. once it has imported the blockchain state)_.

We can create an account (in a different terminal) and get some test Ether:
1.  `geth account new --datadir="$HOME/rinkeby/"`
-   pwd: ``
-   public address: `0x33c1eCDEFC39E92bA35CD0F81a4B6C5A1c63b799`
-   Path of the secret key file: `$HOME/rinkeby/keystore/UTC--`

2.  `geth account new --datadir="$HOME/rinkeby/"`
-   pwd: ``
-   public address: `0xFA05c3336de286463E3f2080a5766b8AB0aF8676`
-   Path of the secret key file: `$HOME/rinkeby/keystore/UTC--`

3.  `geth account new --datadir="$HOME/rinkeby/"`
-   pwd: ``
-   public address: `0xA08C918586b510FCC4FD01Cbe4f94c881eF8E21F`
-   Path of the secret key file: `$HOME/rinkeby/keystore/UTC--`

4.  `geth account new --datadir="$HOME/rinkeby/"`
-   pwd: ``
-   public address: `0xF767b2ccDFDd00621E50cAd8404f41Ce92E96C15`
-   Path of the secret key file: `$HOME/rinkeby/keystore/UTC--`

Note that Rinkeby **test Ether** needs to be credited to your account to send transactions, which can be requested at the [Rinkeby faucet](https://faucet.rinkeby.io/). _The balance on your node will not update until your node is in sync, but you can search for your account on_ [https://rinkeby.etherscan.io/](https://rinkeby.etherscan.io/).

Once we have done all this, we have to wait for our node to catch up with the blockchain.

We can **connect to the running geth instance’s interactive console** by typing the following in the command line: `geth attach ipc:/$HOME/rinkeby/geth.ipc`

The _geth.ipc_ file is automatically created for inter process communication.
The console is a Javascript console with Web3 injected.
We can query the node to see whether it is still syncing by typing: `eth.syncing`
-   Whilst this returns `true` the node is still catching up.
-   When syncing is complete `false` is returned.
    -   Then, you should be able to see latest block number with: `eth.blockNumber`

To execute any transaction, we need to unlock the account we are using, by typing in the interactive console: `personal.unlockAccount('account_public_address', "password", 300)` _(the 3rd argument indicates the number of seconds the account should remain unlocked)_

To keep an account unlocked for the whole time a node is running, add a command line argument in the start up command:
`geth --rinkeby --syncmode fast --rpc --password <(echo ``**password**``) --unlock 0 --datadir="$HOME/rinkeby/"`

This will unlock the fist account in the account list (index 0) with the **password** supplied.

### Deploying the contract

Once there is some Ether and our node is in sync, we can deploy our notary contract.

We will use truffle for this, and will edit the `truffle.js` file to add the network details:

```javascript
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*",
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      gas: 4000000,
    },
  },
};
```

Here, we have added network id 4, which is Rinkeby, and have also supplied the maximum amount of _gas_ we are happy to send for contract deployment _(the other relevant parameter, **`gas price`** could also be used, but for now we will use the default value)._

Let's deploy the contract: `truffle migrate --network rinkeby`

### Connecting to the deployed contract

To connect the CLI to the contract deployed on Rinkeby,
we have to change our initialization code to point to the contract address on Rinkeby,
which we have just received from the deploy operation.

Substitute the address for your own — this address is valid, as an instance of the contract has also been deployed there: `address = "0xd121f94184Da71908123a1e08F72cAB8573b9363";`

Furthermore, instead of connecting to _Ganache_, we now need to connect to our real Ethereum node’s RPC interface. To do so, we need to change the port number of our Web3 provider to whatever our node uses (8545 for _geth_ by default):

    let provider = new Web3.providers.HttpProvider("http://localhost:8545/");
    web3 = new Web3(provider);

As the CLI is now connected to an actual blockchain test network, transactions don’t get mined instantly, so you may have to wait a bit before being able to verify a fingerprint, until the file’s fingerprint been sealed in a new block.

### Next Steps: Developing web interfaces for smart contracts

We now have a working CLI connected to our contract deployed on a real blockchain test network through our own Ethereum node.
Every transaction executed costs our own funds, so if we were to offer this service to the public (through a web interface for example), we could either charge for our service to cover this cost, or find another way to make sure those wishing to certify documents spend there own Ether.

So far, we have developed an Ethereum smart contract for document certification and a command-line tool to make use of the service. Now we will look at how we can make this service publicly available through a web application.

### Designing the web interface

We will use some very basic _html_, although we use the [bootstrap framework](https://getbootstrap.com/) to make the front-end look acceptable.

![image.png](media_Ethereum%20Development%20Guide/image.png)

Let’s create a directory `webapp` and a file `index.html` inside the directory.
-   We are importing some bootstrap related stylesheet and javascript files from content delivery networks, including the [JQuery](https://jquery.com/) library which is used by bootstrap and we will also use it to simplify our own Javascript.
-   The other two libraries we need are [web3](https://github.com/ethereum/web3.js/) and [jsSHA](https://github.com/Caligatio/jsSHA). For jsSHA we just copy the _sha256.js_ file into our webapp_ directory. You can copy this file from the npm imported modules we used in earlier or from the libraries [git repository](https://github.com/Caligatio/jsSHA/tree/master/src).
-   In the case of web3, the required file for the browser version of this library should be in the [_dist folder_](https://github.com/ChainSafe/web3.js/tree/1.x/dist) of the git repository or _npm_ module_ (or from the local _`../cliapp/node_modules/web/dist/`_ directory). However, _**at the time of writing, even the 1.0 branch of the web3 git repository does not include the correct 1.0 version of the library in the dist folder. **_We recommend using version 1.0 in this tutorial, as it makes more sense to learn the updated interface of this new version_. The required file can be build from source, but as this may fail because of missing dependencies on some installations, it may be easiest to copy it from [_this repository_](https://github.com/stbeyer/docCertTutorial/blob/master/webapp/web3.min.js).

The other two Javascript files (**`app.js`** & **`notaryWebLib.js`**) are the ones in which we will develop our application code.

A local web server to serve our web application _(web3 does not work correctly if served from the file system)_. If you do not have a local web server application you may use [http-server](https://www.npmjs.com/package/http-server), which can be installed globally: `(sudo) npm install http-server -g`

Now we can serve our web application on http://localhost:8080 by executing the following command in our webapp directory: `http-server .` and navigate to the page.

### Designing the contract connection

If we connect to our contract through our Ethereum node, we face two issues:
1.  The node does not run on the end-user's computer. To overcome this, we could make it publicly accessible, but it entails a security risk.
2.  Each time a user uploads a document hash, a transaction fee occurs, which is charged to our account.

We could:
1.  Ask our users to run their own Ethereum nodes, but this means that we provide a service that is difficult to use.
2.  Hide our node behind a REST API _(i.e. requests to the contract are sent from the FE to the BE server and from there passed to the Ethereum node)_, and ask our users to pay a fee for submitting a file hash to cover our cost.
3.  Ask our users to sign transactions with their own keys, without running a full node, and using a user-friendly light wallet.

We will use the [MetaMask browser plugin](https://metamask.io/). MetaMask is an Ethereum wallet for the browser. The extension injects a web3 provider into the browser, which allows us to connect to the blockchain via a MetaMask provided node.

We can use web3 as usual and MetaMask will automatically pop up and ask users to confirm transactions and spend their own Ether.
If Metamask is not connected automatically, then ... _**to be defined**_

_In our web application we can tell users to install MetaMask, for example by linking the following image to the _[_MetaMask website_](https://metamask.io/):

![image.png](media_Ethereum%20Development%20Guide/517d8b64-13a1-433e-bc2e-c7670dc37ba2_image.png)

Install MetaMask in your browser and create an account, if you don't have one already, and select Rinkeby as the network to connect to.

### Connecting to our contract

Once we have MetaMask set up to the Rinkeby network, with some test Ether in our account, we can write the missing Javascript code to connect our web interface.

Let’s define a contract wrapper module again, this time in a file called `notaryWebLib.js`
We can create our application code in an `app.js` file in the `webapp/` directory.