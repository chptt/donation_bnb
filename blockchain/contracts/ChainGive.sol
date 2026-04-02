// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainGive
 * @dev Fully on-chain donation platform for BNB Chain Testnet.
 *      Campaign metadata (title, description, image) is stored on IPFS.
 *      All financial logic, donor tracking, and leaderboard data lives here.
 */
contract ChainGive {

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Campaign {
        uint256 id;
        address creator;
        string  metadataURI;   // IPFS CID pointing to JSON metadata
        uint256 targetAmount;  // in wei
        uint256 amountRaised;  // in wei
        uint256 deadline;      // unix timestamp
        bool    isActive;
        uint256 donorCount;
        uint256 createdAt;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    address public owner;
    uint256 public platformFeePercent; // e.g. 2 = 2%
    uint256 public campaignCount;

    mapping(uint256 => Campaign)                       public campaigns;
    mapping(uint256 => Donation[])                     private campaignDonations;
    mapping(uint256 => mapping(address => uint256))    public donorTotals;      // campaignId => donor => total wei
    mapping(address => uint256)                        public totalDonatedBy;   // donor => total wei across all campaigns
    mapping(address => uint256[])                      public campaignsByCreator;
    mapping(address => uint256[])                      public donationsByCampaign; // donor => campaignIds donated to

    // ─── Events ───────────────────────────────────────────────────────────────

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string  metadataURI,
        uint256 targetAmount,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );

    event CampaignDeactivated(uint256 indexed campaignId);
    event MetadataUpdated(uint256 indexed campaignId, string newURI);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier exists(uint256 id) {
        require(id > 0 && id <= campaignCount, "Campaign not found");
        _;
    }

    modifier onlyCreator(uint256 id) {
        require(campaigns[id].creator == msg.sender, "Not campaign creator");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(uint256 _fee) {
        require(_fee <= 10, "Fee too high");
        owner = msg.sender;
        platformFeePercent = _fee;
    }

    // ─── Campaign Functions ───────────────────────────────────────────────────

    /**
     * @notice Create a new campaign. Metadata (title, desc, image) lives on IPFS.
     * @param _metadataURI  IPFS URI: ipfs://<CID>
     * @param _targetAmount Fundraising goal in wei
     * @param _deadline     Unix timestamp for campaign end
     */
    function createCampaign(
        string calldata _metadataURI,
        uint256 _targetAmount,
        uint256 _deadline
    ) external returns (uint256) {
        require(bytes(_metadataURI).length > 0, "Metadata URI required");
        require(_targetAmount > 0, "Target must be > 0");
        require(_deadline > block.timestamp, "Deadline must be future");

        campaignCount++;
        uint256 id = campaignCount;

        campaigns[id] = Campaign({
            id:           id,
            creator:      msg.sender,
            metadataURI:  _metadataURI,
            targetAmount: _targetAmount,
            amountRaised: 0,
            deadline:     _deadline,
            isActive:     true,
            donorCount:   0,
            createdAt:    block.timestamp
        });

        campaignsByCreator[msg.sender].push(id);

        emit CampaignCreated(id, msg.sender, _metadataURI, _targetAmount, _deadline);
        return id;
    }

    /**
     * @notice Donate BNB to a campaign.
     */
    function donateToCampaign(uint256 _id) external payable exists(_id) {
        Campaign storage c = campaigns[_id];
        require(c.isActive, "Campaign inactive");
        require(block.timestamp <= c.deadline, "Campaign ended");
        require(msg.value > 0, "Must send BNB");

        bool isNewDonor = donorTotals[_id][msg.sender] == 0;

        c.amountRaised += msg.value;
        donorTotals[_id][msg.sender] += msg.value;
        totalDonatedBy[msg.sender] += msg.value;

        if (isNewDonor) {
            c.donorCount++;
            donationsByCampaign[msg.sender].push(_id);
        }

        campaignDonations[_id].push(Donation({
            donor:     msg.sender,
            amount:    msg.value,
            timestamp: block.timestamp
        }));

        // Transfer to creator minus fee
        uint256 fee = (msg.value * platformFeePercent) / 100;
        uint256 toCreator = msg.value - fee;

        (bool ok1, ) = c.creator.call{value: toCreator}("");
        require(ok1, "Creator transfer failed");

        if (fee > 0) {
            (bool ok2, ) = owner.call{value: fee}("");
            require(ok2, "Fee transfer failed");
        }

        emit DonationReceived(_id, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Deactivate a campaign (creator or owner).
     */
    function deactivateCampaign(uint256 _id) external exists(_id) {
        require(
            msg.sender == campaigns[_id].creator || msg.sender == owner,
            "Not authorized"
        );
        campaigns[_id].isActive = false;
        emit CampaignDeactivated(_id);
    }

    /**
     * @notice Update IPFS metadata URI (off-chain data changed).
     */
    function updateMetadata(uint256 _id, string calldata _newURI)
        external exists(_id) onlyCreator(_id)
    {
        campaigns[_id].metadataURI = _newURI;
        emit MetadataUpdated(_id, _newURI);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getCampaign(uint256 _id) external view exists(_id) returns (Campaign memory) {
        return campaigns[_id];
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint256 i = 1; i <= campaignCount; i++) {
            all[i - 1] = campaigns[i];
        }
        return all;
    }

    function getCampaignDonations(uint256 _id)
        external view exists(_id) returns (Donation[] memory)
    {
        return campaignDonations[_id];
    }

    function getTotalRaised(uint256 _id) external view exists(_id) returns (uint256) {
        return campaigns[_id].amountRaised;
    }

    function getCampaignOwner(uint256 _id) external view exists(_id) returns (address) {
        return campaigns[_id].creator;
    }

    function getCampaignsByCreator(address _creator) external view returns (uint256[] memory) {
        return campaignsByCreator[_creator];
    }

    function getDonorTotal(uint256 _id, address _donor) external view returns (uint256) {
        return donorTotals[_id][_donor];
    }

    function getTotalDonatedBy(address _donor) external view returns (uint256) {
        return totalDonatedBy[_donor];
    }

    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }

    function getDonatedCampaigns(address _donor) external view returns (uint256[] memory) {
        return donationsByCampaign[_donor];
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10, "Fee too high");
        platformFeePercent = _fee;
    }

    function transferOwnership(address _new) external onlyOwner {
        require(_new != address(0), "Zero address");
        owner = _new;
    }

    receive() external payable {}
}
