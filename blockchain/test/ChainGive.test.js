const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainGive", function () {
  let chainGive;
  let owner, creator, donor1, donor2;
  const ONE_DAY = 86400;

  beforeEach(async () => {
    [owner, creator, donor1, donor2] = await ethers.getSigners();
    const ChainGive = await ethers.getContractFactory("ChainGive");
    chainGive = await ChainGive.deploy(2); // 2% fee
  });

  describe("Campaign Creation", () => {
    it("should create a campaign", async () => {
      const deadline = Math.floor(Date.now() / 1000) + ONE_DAY;
      const target = ethers.parseEther("1.0");

      await expect(
        chainGive.connect(creator).createCampaign(
          "Test Campaign",
          "ipfs://metadata",
          target,
          deadline
        )
      ).to.emit(chainGive, "CampaignCreated");

      const campaign = await chainGive.getCampaign(1);
      expect(campaign.title).to.equal("Test Campaign");
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.targetAmount).to.equal(target);
      expect(campaign.isActive).to.be.true;
    });

    it("should reject campaign with past deadline", async () => {
      const pastDeadline = Math.floor(Date.now() / 1000) - ONE_DAY;
      await expect(
        chainGive.connect(creator).createCampaign(
          "Bad Campaign",
          "ipfs://metadata",
          ethers.parseEther("1.0"),
          pastDeadline
        )
      ).to.be.revertedWith("ChainGive: Deadline must be in future");
    });
  });

  describe("Donations", () => {
    let campaignId;

    beforeEach(async () => {
      const deadline = Math.floor(Date.now() / 1000) + ONE_DAY;
      const tx = await chainGive.connect(creator).createCampaign(
        "Test Campaign",
        "ipfs://metadata",
        ethers.parseEther("10.0"),
        deadline
      );
      await tx.wait();
      campaignId = 1;
    });

    it("should accept donations and emit event", async () => {
      const donationAmount = ethers.parseEther("0.5");
      await expect(
        chainGive.connect(donor1).donateToCampaign(campaignId, { value: donationAmount })
      ).to.emit(chainGive, "DonationReceived").withArgs(campaignId, donor1.address, donationAmount, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("should update amountRaised", async () => {
      const donationAmount = ethers.parseEther("0.5");
      await chainGive.connect(donor1).donateToCampaign(campaignId, { value: donationAmount });

      const total = await chainGive.getTotalRaised(campaignId);
      expect(total).to.equal(donationAmount);
    });

    it("should track donor count", async () => {
      await chainGive.connect(donor1).donateToCampaign(campaignId, { value: ethers.parseEther("0.1") });
      await chainGive.connect(donor2).donateToCampaign(campaignId, { value: ethers.parseEther("0.2") });

      const campaign = await chainGive.getCampaign(campaignId);
      expect(campaign.donorCount).to.equal(2);
    });

    it("should reject donation to inactive campaign", async () => {
      await chainGive.connect(creator).deactivateCampaign(campaignId);
      await expect(
        chainGive.connect(donor1).donateToCampaign(campaignId, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("ChainGive: Campaign is not active");
    });
  });

  describe("Leaderboard Data", () => {
    it("should track total donated by address", async () => {
      const deadline = Math.floor(Date.now() / 1000) + ONE_DAY;
      await chainGive.connect(creator).createCampaign("C1", "uri", ethers.parseEther("5"), deadline);
      await chainGive.connect(creator).createCampaign("C2", "uri", ethers.parseEther("5"), deadline);

      await chainGive.connect(donor1).donateToCampaign(1, { value: ethers.parseEther("0.3") });
      await chainGive.connect(donor1).donateToCampaign(2, { value: ethers.parseEther("0.2") });

      const total = await chainGive.getTotalDonatedByAddress(donor1.address);
      expect(total).to.equal(ethers.parseEther("0.5"));
    });
  });
});
