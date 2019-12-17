pragma solidity ^0.5.0;

contract Marketplace{
	string public name; //global variable. Can access it outside the smart contract using public.
	uint public productCount = 0;
    mapping (uint => Product) public products; //uint id is the key for this mapping

    struct Product{ //every product will follow this pattern
       uint id; //means positive integer
       string name;
       uint price;
       address payable owner;
       bool purchased;
    }
    

    event productCreated(
       uint id,
       string name,
       uint price,
       address payable owner,
       bool purchased
    );

     event ProductPurchased(
       uint id,
       string name,
       uint price,
       address payable owner,
       bool purchased
    );

	constructor() public{ //  only run once when smart contarct is deployed
         name = "USM Market place";
	} 

    function createProduct(string memory _name, uint _price) public{ //_name is local variable
     //Require a valid name
     require(bytes(_name).length > 0);
     //Require a valid price
     require(_price > 0);
       //Make sure parameters are correct
       //Increment Product count
       productCount++;
      //Create products
      //Trigger an event
      products[productCount] = Product(productCount, _name, _price, msg.sender, false);
      emit productCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable{  //use payable keyword to send ether to the seller
  // Fetch the product
    Product memory _product = products[_id];
    // Fetch the owner
    address payable _seller = _product.owner;
    // Make sure the product has a valid id
    require(_product.id > 0 && _product.id <= productCount);
    // Require that there is enough Ether in the transaction
    require(msg.value >= _product.price);
    // Require that the product has not been purchased already
    require(!_product.purchased);
    // Require that the buyer is not the seller
    require(_seller != msg.sender);
    // Transfer ownership to the buyer
    _product.owner = msg.sender;
    // Mark as purchased
    _product.purchased = true;
    // Update the product
    products[_id] = _product;
    // Pay the seller by sending them Ether
    address(_seller).transfer(msg.value);
    // Trigger an event
    emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);

    }
}