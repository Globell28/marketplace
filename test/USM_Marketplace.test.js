const USM_Marketplace = artifacts.require('./USM_Marketplace.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('USM_Marketplace', ([deployer, seller, buyer]) => {
  let usm_marketplace

  before(async () => {
    usm_marketplace = await USM_Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('USM Online shopping deploys successfully', async () => {
      const address = await usm_marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('USM Online shopping has a name', async () => {
      const name = await usm_marketplace.name()
      assert.equal(name, 'USM Online Shopping')
    })

  })
   describe('products', async () => {
    let result, productCount

    before(async () => {
      result = await usm_marketplace.createProduct('Long grain rice', web3.utils.toWei('1', 'Ether'), { from: seller })
      productCount = await usm_marketplace.productCounter()
    })

    it('creates products', async () => {
      // SUCCESS
      assert.equal(productCount, 1)
      //console.log(result.logs)
      const event = result.logs[0].args
      //console.log(event)
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'Long grain rice', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // FAILURE: Product must have a name
      await await usm_marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Product must have a price
      await await usm_marketplace.createProduct('Long grain rice', 0, { from: seller }).should.be.rejected;
    })

  it(' It lists and displays products', async () => {
      const product = await usm_marketplace.usmproducts(productCount)
      assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(product.name, 'Long grain rice', 'name is correct')
      assert.equal(product.price, '1000000000000000000', 'price is correct')
      assert.equal(product.owner, seller , 'owner is correct')
      assert.equal(product.purchased, false, 'purchased is correct')
     
   })

    it('sells products', async () => {
    // Track the seller balance before purchase
    let oldSellerBalance
    oldSellerBalance = await web3.eth.getBalance(seller)
    oldSellerBalance = new web3.utils.BN(oldSellerBalance)

    // SUCCESS: Buyer makes purchase
    result = await usm_marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
   
    // Check logs
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
    assert.equal(event.name, 'Long grain rice', 'name is correct')
    assert.equal(event.price, '1000000000000000000', 'price is correct')
    assert.equal(event.owner, buyer, 'owner is correct')
    assert.equal(event.purchased, true, 'purchased is correct')

     //console.log(result.logs)
     //console.log(event)

    // Check that seller received funds
    let newSellerBalance
    newSellerBalance = await web3.eth.getBalance(seller)
    newSellerBalance = new web3.utils.BN(newSellerBalance)

    let price
    price = web3.utils.toWei('1', 'Ether')
    price = new web3.utils.BN(price)

    const exepectedBalance = oldSellerBalance.add(price)
      console.log(exepectedBalance)
    
    assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

    // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
    await usm_marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
    // FAILURE: Buyer tries to buy without enough ether
    await usm_marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
    // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
    await usm_marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
    await usm_marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;

   })
  })
})
