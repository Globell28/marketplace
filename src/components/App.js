import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {
  
  async componentWillMount(){
      await this.loadWeb3()
      await this.loadBlockchainData()
  }

  async loadWeb3(){ //connect web3.js to metamask
    //detects if metamask is present. 
    //modern dapp browser
    if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  } //older dapp browser
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
   }
 }

 async loadBlockchainData(){
  const web3 = window.web3
  //load account
  const accounts = await web3.eth.getAccounts()
  this.setState ({account: accounts[0]})
  //console.log(accounts)
  const networkId = await web3.eth.net.getId();
  const networkData = Marketplace.networks[networkId]

  if(networkData){
    const marketPlace = web3.eth.Contract(Marketplace.abi, networkData.address)
    this.setState({marketPlace})
    const productCount = await marketPlace.methods.productCount().call()
  //  console.log(productCount.toString())

    //Load Products
    for(var i=1; i<=productCount; i++){
      const product = await marketPlace.methods.products(i).call()
      this.setState({
        products: [...this.state.products, product]
      })
    }
    this.setState({loading: false})
  //  console.log(this.state.products)
    console.log(marketPlace)
  }else{
    window.alert('Marketplace Contract not deployed to detected network.')
  }

 // console.log(networkId)
  //const abi = Marketplace.abi;
 // const address = Marketplace.networks[networkId].address

  //console.log(Marketplace.abi, Marketplace.networks[5777].address);
 }

 constructor (props){
   super(props)
   this.state = {
    account: '',
    productCount:0,
    products: [],
    loading: true
   }

   this.createProduct = this.createProduct.bind(this)
   this.purchaseProduct = this.purchaseProduct.bind(this)
 }

  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.marketPlace.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketPlace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main products ={this.state.products} 
                  createProduct={this.createProduct} 
                 purchaseProduct={this.purchaseProduct} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}



export default App;
