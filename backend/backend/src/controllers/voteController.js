const Vote = require("../models/Vote");
const Poll = require("../models/Poll");


// POST /api/polls/:id/vote
// Handles first vote OR change vote
exports.voteOnPoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { selectedOption } = req.body;
    const userId = req.user._id;

    // 1️⃣ Check poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // 2️⃣ Validate option
    const optionExists = poll.options.find(
      (opt) => opt.text === selectedOption
    );

    if (!optionExists) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    // 3️⃣ Check if user already voted
    const existingVote = await Vote.findOne({
      poll: pollId,
      user: userId
    });

    // CASE 1️⃣ First vote
    if (!existingVote) {
      await Vote.create({
        poll: pollId,
        user: userId,
        selectedOption
      });

      await Poll.updateOne(
        { _id: pollId, "options.text": selectedOption },
        { $inc: { "options.$.voteCount": 1 } }
      );

      return res.status(200).json({
        message: "Vote recorded successfully"
      });
    }

    // CASE 2️⃣ User selected same option again
    if (existingVote.selectedOption === selectedOption) {
      return res.status(400).json({
        message: "You have already voted for this option"
      });
    }

    // CASE 3️⃣ Change vote
    const previousOption = existingVote.selectedOption;

    // Decrement previous vote
    await Poll.updateOne(
      { _id: pollId, "options.text": previousOption },
      { $inc: { "options.$.voteCount": -1 } }
    );

    // Increment new vote
    await Poll.updateOne(
      { _id: pollId, "options.text": selectedOption },
      { $inc: { "options.$.voteCount": 1 } }
    );

    existingVote.selectedOption = selectedOption;
    await existingVote.save();

    res.status(200).json({
      message: "Vote updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE /api/polls/:id/vote
// Removes user's vote completely
exports.removeVote = async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user._id;

    const existingVote = await Vote.findOne({
      poll: pollId,
      user: userId
    });

    if (!existingVote) {
      return res.status(404).json({
        message: "You have not voted on this poll"
      });
    }

    // Decrement vote count
    await Poll.updateOne(
      { _id: pollId, "options.text": existingVote.selectedOption },
      { $inc: { "options.$.voteCount": -1 } }
    );

    // Delete vote document
    await existingVote.deleteOne();

    res.status(200).json({
      message: "Vote removed successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};