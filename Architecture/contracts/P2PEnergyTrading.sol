// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title P2PEnergyTrading
 * @dev MVP version - Basic peer-to-peer energy trading
 * Sellers list energy, buyers purchase directly
 */
contract P2PEnergyTrading {
    
    struct EnergyListing {
        address seller;
        uint256 amountKwh;
        uint256 pricePerKwh; // Price in wei per kWh
        uint256 expiryTime;
        bool active;
        string location; // Simple string for MVP
    }
    
    struct Trade {
        uint256 listingId;
        address buyer;
        address seller;
        uint256 amountKwh;
        uint256 totalPrice;
        uint256 timestamp;
        bool completed;
    }
    
    EnergyListing[] public listings;
    Trade[] public trades;
    
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userTrades;
    
    uint256 public marketPrice = 150 wei; // Base market price per kWh
    address public owner;
    
    // Events
    event EnergyListed(
        uint256 indexed listingId, 
        address indexed seller, 
        uint256 amount, 
        uint256 price
    );
    event TradExecuted(
        uint256 indexed tradeId, 
        uint256 indexed listingId,
        address indexed buyer, 
        address seller,
        uint256 amount,
        uint256 totalPrice
    );
    event ListingCancelled(uint256 indexed listingId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev List energy for sale
     */
    function listEnergy(
        uint256 _amountKwh,
        uint256 _pricePerKwh,
        uint256 _durationHours,
        string memory _location
    ) external {
        require(_amountKwh > 0, "Amount must be greater than 0");
        require(_pricePerKwh > 0, "Price must be greater than 0");
        require(_durationHours > 0, "Duration must be greater than 0");
        
        uint256 listingId = listings.length;
        
        listings.push(EnergyListing({
            seller: msg.sender,
            amountKwh: _amountKwh,
            pricePerKwh: _pricePerKwh,
            expiryTime: block.timestamp + (_durationHours * 1 hours),
            active: true,
            location: _location
        }));
        
        userListings[msg.sender].push(listingId);
        
        emit EnergyListed(listingId, msg.sender, _amountKwh, _pricePerKwh);
    }
    
    /**
     * @dev Buy energy from a listing
     */
    function buyEnergy(uint256 _listingId, uint256 _amountKwh) external payable {
        require(_listingId < listings.length, "Invalid listing ID");
        
        EnergyListing storage listing = listings[_listingId];
        require(listing.active, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy your own energy");
        require(block.timestamp < listing.expiryTime, "Listing expired");
        require(_amountKwh > 0, "Amount must be greater than 0");
        require(_amountKwh <= listing.amountKwh, "Not enough energy available");
        
        uint256 totalPrice = _amountKwh * listing.pricePerKwh;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Update listing
        listing.amountKwh -= _amountKwh;
        if (listing.amountKwh == 0) {
            listing.active = false;
        }
        
        // Create trade record
        uint256 tradeId = trades.length;
        trades.push(Trade({
            listingId: _listingId,
            buyer: msg.sender,
            seller: listing.seller,
            amountKwh: _amountKwh,
            totalPrice: totalPrice,
            timestamp: block.timestamp,
            completed: true
        }));
        
        userTrades[msg.sender].push(tradeId);
        userTrades[listing.seller].push(tradeId);
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: totalPrice}("");
        require(success, "Payment transfer failed");
        
        // Return excess payment
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TradExecuted(
            tradeId,
            _listingId,
            msg.sender,
            listing.seller,
            _amountKwh,
            totalPrice
        );
    }
    
    /**
     * @dev Cancel a listing (seller only)
     */
    function cancelListing(uint256 _listingId) external {
        require(_listingId < listings.length, "Invalid listing ID");
        
        EnergyListing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.active, "Listing not active");
        
        listing.active = false;
        
        emit ListingCancelled(_listingId);
    }
    
    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // First, count active listings
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active && block.timestamp < listings[i].expiryTime) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active && block.timestamp < listings[i].expiryTime) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listing details
     */
    function getListingDetails(uint256 _listingId) external view returns (
        address seller,
        uint256 amountKwh,
        uint256 pricePerKwh,
        uint256 expiryTime,
        bool active,
        string memory location
    ) {
        require(_listingId < listings.length, "Invalid listing ID");
        
        EnergyListing memory listing = listings[_listingId];
        return (
            listing.seller,
            listing.amountKwh,
            listing.pricePerKwh,
            listing.expiryTime,
            listing.active,
            listing.location
        );
    }
    
    /**
     * @dev Get user's listings
     */
    function getUserListings(address _user) external view returns (uint256[] memory) {
        return userListings[_user];
    }
    
    /**
     * @dev Get user's trades
     */
    function getUserTrades(address _user) external view returns (uint256[] memory) {
        return userTrades[_user];
    }
    
    /**
     * @dev Get trade details
     */
    function getTradeDetails(uint256 _tradeId) external view returns (
        uint256 listingId,
        address buyer,
        address seller,
        uint256 amountKwh,
        uint256 totalPrice,
        uint256 timestamp
    ) {
        require(_tradeId < trades.length, "Invalid trade ID");
        
        Trade memory trade = trades[_tradeId];
        return (
            trade.listingId,
            trade.buyer,
            trade.seller,
            trade.amountKwh,
            trade.totalPrice,
            trade.timestamp
        );
    }
    
    /**
     * @dev Get market statistics
     */
    function getMarketStats() external view returns (
        uint256 totalListings,
        uint256 activeListings,
        uint256 totalTrades,
        uint256 currentMarketPrice
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active && block.timestamp < listings[i].expiryTime) {
                activeCount++;
            }
        }
        
        return (
            listings.length,
            activeCount,
            trades.length,
            marketPrice
        );
    }
    
    /**
     * @dev Admin function to update market price
     */
    function updateMarketPrice(uint256 _newPrice) external onlyOwner {
        marketPrice = _newPrice;
    }
}