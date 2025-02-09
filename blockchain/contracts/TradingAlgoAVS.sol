// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "hardhat/console.sol";

contract TradingAlgoAVS {
    struct Strategy {
        uint256 id;
        address provider; // 策略提供者的錢包地址
        uint256 subscriptionFee; // 訂閱費用
        string subscriptionPeriod; // "day", "week", "month"
        string strategyUid; // 後端給的唯一策略 ID
        uint256 roi; // 投資回報率
        uint256 profitability; // 獲利能力
        uint256 risk; // 風險數值
        bool active; // 是否啟用
    }

    struct Subscription {
        uint256 strategyId;
        address subscriber;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    uint256 private nextStrategyId;
    mapping(uint256 => Strategy) public strategies;
    mapping(address => mapping(uint256 => Subscription)) public subscriptions; // subscriber => strategyId => Subscription
    mapping(address => uint256[]) public userSubscriptions; // user => array of strategy IDs
    mapping(uint256 => uint256) public activeSubscribersCount; // strategyId => active subscription count
    mapping(uint256 => uint256) public totalSubscribersCount; // strategyId => total subscription count ever

    event StrategyCreated(
        uint256 indexed strategyId,
        address indexed provider,
        uint256 subscriptionFee,
        string subscriptionPeriod,
        string strategyUid,
        uint256 roi,
        uint256 profitability,
        uint256 risk
    );

    event StrategySubscribed(
        uint256 indexed strategyId,
        address indexed subscriber,
        uint256 subscriptionFee,
        string subscriptionPeriod,
        uint256 startTime,
        uint256 endTime
    );

    event StrategyUnsubscribed(
        uint256 indexed strategyId,
        address indexed subscriber
    );

    function createStrategy(
        string memory _strategyUid,
        uint256 _subscriptionFee,
        string memory _subscriptionPeriod,
        uint256 _roi,
        uint256 _profitability,
        uint256 _risk
    ) public {
        console.log("Creating strategy with UID: %s", _strategyUid);
        console.log("Sender Address: %s", msg.sender);

        require(
            keccak256(abi.encodePacked(_subscriptionPeriod)) == keccak256(abi.encodePacked("day")) ||
            keccak256(abi.encodePacked(_subscriptionPeriod)) == keccak256(abi.encodePacked("week")) ||
            keccak256(abi.encodePacked(_subscriptionPeriod)) == keccak256(abi.encodePacked("month")),
            "Invalid subscription period"
        );

        strategies[nextStrategyId] = Strategy(
            nextStrategyId,
            msg.sender,
            _subscriptionFee,
            _subscriptionPeriod,
            _strategyUid,
            _roi,
            _profitability,
            _risk,
            true
        );

        emit StrategyCreated(
            nextStrategyId,
            msg.sender,
            _subscriptionFee,
            _subscriptionPeriod,
            _strategyUid,
            _roi,
            _profitability,
            _risk
        );

        nextStrategyId++;
    }

    function getStrategy(uint256 _id) public view returns (Strategy memory) {
        return strategies[_id];
    }

    function getAllStrategies() public view returns (Strategy[] memory) {
        Strategy[] memory allStrategies = new Strategy[](nextStrategyId);
        for (uint256 i = 0; i < nextStrategyId; i++) {
            allStrategies[i] = strategies[i];
        }
        return allStrategies;
    }

    function subscribeStrategy(uint256 _id) public payable {
        Strategy storage strategy = strategies[_id];
        require(msg.value == strategy.subscriptionFee, "Incorrect subscription fee");
        require(subscriptions[msg.sender][_id].active == false, "Already subscribed");

        uint256 duration;
        if (keccak256(abi.encodePacked(strategy.subscriptionPeriod)) == keccak256(abi.encodePacked("day"))) {
            duration = 1 days;
        } else if (keccak256(abi.encodePacked(strategy.subscriptionPeriod)) == keccak256(abi.encodePacked("week"))) {
            duration = 7 days;
        } else if (keccak256(abi.encodePacked(strategy.subscriptionPeriod)) == keccak256(abi.encodePacked("month"))) {
            duration = 30 days;
        }

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        subscriptions[msg.sender][_id] = Subscription({
            strategyId: _id,
            subscriber: msg.sender,
            startTime: startTime,
            endTime: endTime,
            active: true
        });

        userSubscriptions[msg.sender].push(_id); // Track user's subscriptions
        activeSubscribersCount[_id]++; // Increment active subscriber count
        totalSubscribersCount[_id]++; // Increment total ever subscribed count

        payable(strategy.provider).transfer(msg.value);

        console.log("Subscriber Address: %s", msg.sender);

        emit StrategySubscribed(_id, msg.sender, strategy.subscriptionFee, strategy.subscriptionPeriod, startTime, endTime);
    }

    function unsubscribeStrategy(uint256 _id) public {
        require(subscriptions[msg.sender][_id].active, "Not subscribed");

        subscriptions[msg.sender][_id].active = false;
        activeSubscribersCount[_id]--; // Decrease active subscriber count

        emit StrategyUnsubscribed(_id, msg.sender);
    }

    function isSubscribed(address _subscriber, uint256 _id) public view returns (bool) {
        return subscriptions[_subscriber][_id].active;
    }

    function getUserSubscriptions(address _subscriber) public view returns (uint256[] memory) {
        return userSubscriptions[_subscriber];
    }

    function getActiveSubscribersCount(uint256 _id) public view returns (uint256) {
        return activeSubscribersCount[_id];
    }

    function getTotalSubscribersCount(uint256 _id) public view returns (uint256) {
        return totalSubscribersCount[_id];
    }
    
    function getMyStrategies() public view returns (Strategy[] memory) {
        uint256 count = 0;
        // **Count strategies created by msg.sender**
        for (uint256 i = 0; i < nextStrategyId; i++) {
            if (strategies[i].provider == msg.sender) {
                count++;
            }
        }

        // **Create an array with the correct size**
        Strategy[] memory myStrategies = new Strategy[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextStrategyId; i++) {
            if (strategies[i].provider == msg.sender) {
                myStrategies[index] = strategies[i];
                index++;
            }
        }
        return myStrategies;
    }
}
