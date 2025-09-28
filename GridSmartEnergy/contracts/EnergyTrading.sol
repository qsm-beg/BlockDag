// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EnergyTrading {
    enum OrderType { SELL, BUY }
    enum OrderStatus { ACTIVE, EXECUTED, CANCELLED, EXPIRED }
    enum EnergySource { SOLAR, BATTERY, WIND, OTHER }

    struct Order {
        uint256 id;
        address creator;
        OrderType orderType;
        uint256 amount; // kWh amount
        uint256 pricePerKwh; // Price in wei per kWh
        OrderStatus status;
        EnergySource source;
        uint256 timestamp;
        uint256 expiry;
    }

    struct Trade {
        uint256 orderId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 totalPrice;
        uint256 timestamp;
    }

    struct UserProfile {
        uint256 totalEnergyTraded;
        uint256 totalTransactions;
        uint256 reputation; // 0-100 score
        bool isVerifiedProducer;
    }

    mapping(uint256 => Order) public orders;
    mapping(uint256 => Trade) public trades;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256[]) public userTrades;

    uint256 public nextOrderId = 1;
    uint256 public nextTradeId = 1;
    uint256 public totalVolumeTraded;
    uint256 public platformFeePercentage = 10; // 1% fee (scaled by 10)

    address public admin;
    address public feeCollector;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed creator,
        OrderType orderType,
        uint256 amount,
        uint256 pricePerKwh
    );

    event TradeExecuted(
        uint256 indexed tradeId,
        uint256 indexed orderId,
        address indexed buyer,
        address seller,
        uint256 amount,
        uint256 totalPrice
    );

    event OrderCancelled(uint256 indexed orderId, address indexed canceller);

    event OrderExpired(uint256 indexed orderId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier orderExists(uint256 _orderId) {
        require(_orderId > 0 && _orderId < nextOrderId, "Order does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
        feeCollector = msg.sender;
    }

    function createSellOrder(
        uint256 _amount,
        uint256 _pricePerKwh,
        EnergySource _source
    ) external returns (uint256) {
        require(_amount >= 1 * 10**18 && _amount <= 100 * 10**18, "Invalid amount");
        require(_pricePerKwh >= 1 * 10**17 && _pricePerKwh <= 2 * 10**18, "Invalid price");

        uint256 orderId = nextOrderId++;
        uint256 expiry = block.timestamp + 86400; // 24 hours

        orders[orderId] = Order({
            id: orderId,
            creator: msg.sender,
            orderType: OrderType.SELL,
            amount: _amount,
            pricePerKwh: _pricePerKwh,
            status: OrderStatus.ACTIVE,
            source: _source,
            timestamp: block.timestamp,
            expiry: expiry
        });

        userOrders[msg.sender].push(orderId);

        emit OrderCreated(orderId, msg.sender, OrderType.SELL, _amount, _pricePerKwh);

        return orderId;
    }

    function createBuyOrder(uint256 _amount, uint256 _maxPricePerKwh) external payable returns (uint256) {
        require(_amount >= 1 * 10**18 && _amount <= 100 * 10**18, "Invalid amount");
        require(_maxPricePerKwh >= 1 * 10**17 && _maxPricePerKwh <= 2 * 10**18, "Invalid price");

        uint256 maxTotalPrice = (_amount * _maxPricePerKwh) / 10**18;
        require(msg.value >= maxTotalPrice, "Insufficient payment");

        uint256 orderId = nextOrderId++;
        uint256 expiry = block.timestamp + 86400; // 24 hours

        orders[orderId] = Order({
            id: orderId,
            creator: msg.sender,
            orderType: OrderType.BUY,
            amount: _amount,
            pricePerKwh: _maxPricePerKwh,
            status: OrderStatus.ACTIVE,
            source: EnergySource.OTHER,
            timestamp: block.timestamp,
            expiry: expiry
        });

        userOrders[msg.sender].push(orderId);

        emit OrderCreated(orderId, msg.sender, OrderType.BUY, _amount, _maxPricePerKwh);

        return orderId;
    }

    function executeTrade(uint256 _orderId) external payable orderExists(_orderId) {
        Order storage order = orders[_orderId];

        require(order.status == OrderStatus.ACTIVE, "Order not active");
        require(block.timestamp < order.expiry, "Order expired");
        require(order.creator != msg.sender, "Cannot trade with yourself");

        if (order.orderType == OrderType.SELL) {
            // Buyer executes a sell order
            uint256 totalPrice = (order.amount * order.pricePerKwh) / 10**18;
            require(msg.value >= totalPrice, "Insufficient payment");

            executeSellOrder(_orderId, order, totalPrice);
        } else {
            // Seller executes a buy order
            executeBuyOrder(_orderId, order);
        }
    }

    function executeSellOrder(uint256 _orderId, Order storage _order, uint256 _totalPrice) private {
        uint256 fee = (_totalPrice * platformFeePercentage) / 1000;
        uint256 sellerAmount = _totalPrice - fee;

        // Create trade record
        uint256 tradeId = nextTradeId++;
        trades[tradeId] = Trade({
            orderId: _orderId,
            buyer: msg.sender,
            seller: _order.creator,
            amount: _order.amount,
            totalPrice: _totalPrice,
            timestamp: block.timestamp
        });

        // Update order status
        _order.status = OrderStatus.EXECUTED;

        // Update user profiles
        updateUserProfile(msg.sender, _order.amount, true);
        updateUserProfile(_order.creator, _order.amount, false);

        // Record trade for both parties
        userTrades[msg.sender].push(tradeId);
        userTrades[_order.creator].push(tradeId);

        // Update total volume
        totalVolumeTraded += _order.amount;

        // Transfer funds (in production)
        // payable(_order.creator).transfer(sellerAmount);
        // payable(feeCollector).transfer(fee);

        // Return excess payment
        if (msg.value > _totalPrice) {
            // payable(msg.sender).transfer(msg.value - _totalPrice);
        }

        emit TradeExecuted(tradeId, _orderId, msg.sender, _order.creator, _order.amount, _totalPrice);
    }

    function executeBuyOrder(uint256 _orderId, Order storage _order) private {
        uint256 totalPrice = (_order.amount * _order.pricePerKwh) / 10**18;
        uint256 fee = (totalPrice * platformFeePercentage) / 1000;

        // Create trade record
        uint256 tradeId = nextTradeId++;
        trades[tradeId] = Trade({
            orderId: _orderId,
            buyer: _order.creator,
            seller: msg.sender,
            amount: _order.amount,
            totalPrice: totalPrice,
            timestamp: block.timestamp
        });

        // Update order status
        _order.status = OrderStatus.EXECUTED;

        // Update user profiles
        updateUserProfile(_order.creator, _order.amount, true);
        updateUserProfile(msg.sender, _order.amount, false);

        // Record trade for both parties
        userTrades[_order.creator].push(tradeId);
        userTrades[msg.sender].push(tradeId);

        // Update total volume
        totalVolumeTraded += _order.amount;

        // Transfer funds (in production)
        // payable(msg.sender).transfer(totalPrice - fee);
        // payable(feeCollector).transfer(fee);

        emit TradeExecuted(tradeId, _orderId, _order.creator, msg.sender, _order.amount, totalPrice);
    }

    function cancelOrder(uint256 _orderId) external orderExists(_orderId) {
        Order storage order = orders[_orderId];

        require(order.creator == msg.sender, "Not order creator");
        require(order.status == OrderStatus.ACTIVE, "Order not active");

        order.status = OrderStatus.CANCELLED;

        // Refund for buy orders
        if (order.orderType == OrderType.BUY) {
            uint256 refundAmount = (order.amount * order.pricePerKwh) / 10**18;
            // payable(msg.sender).transfer(refundAmount);
        }

        emit OrderCancelled(_orderId, msg.sender);
    }

    function updateUserProfile(address _user, uint256 _amount, bool _isBuyer) private {
        UserProfile storage profile = userProfiles[_user];
        profile.totalEnergyTraded += _amount;
        profile.totalTransactions++;

        // Simple reputation system
        if (profile.totalTransactions > 0) {
            profile.reputation = min(100, profile.reputation + 1);
        }
    }

    function getActiveOrders() external view returns (Order[] memory) {
        uint256 activeCount = 0;

        // Count active orders
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (orders[i].status == OrderStatus.ACTIVE && orders[i].expiry > block.timestamp) {
                activeCount++;
            }
        }

        // Collect active orders
        Order[] memory activeOrders = new Order[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i < nextOrderId; i++) {
            if (orders[i].status == OrderStatus.ACTIVE && orders[i].expiry > block.timestamp) {
                activeOrders[index] = orders[i];
                index++;
            }
        }

        return activeOrders;
    }

    function getUserOrders(address _user) external view returns (uint256[] memory) {
        return userOrders[_user];
    }

    function getUserTrades(address _user) external view returns (uint256[] memory) {
        return userTrades[_user];
    }

    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }

    function setFeePercentage(uint256 _feePercentage) external onlyAdmin {
        require(_feePercentage <= 50, "Fee too high"); // Max 5%
        platformFeePercentage = _feePercentage;
    }

    function setFeeCollector(address _feeCollector) external onlyAdmin {
        feeCollector = _feeCollector;
    }

    function verifyProducer(address _producer) external onlyAdmin {
        userProfiles[_producer].isVerifiedProducer = true;
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}