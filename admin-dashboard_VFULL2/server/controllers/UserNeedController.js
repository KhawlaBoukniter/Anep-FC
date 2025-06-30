const UserNeed = require('../models/UserNeed');

// Create a user need
exports.createUserNeed = async (req, res) => {
  try {
    const { title , message } = req.body;
    const userNeed = new UserNeed({
      message,
      title
    });
    await userNeed.save();
    res.status(201).json(userNeed);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user need' });
  }
};

// Get all user needs
exports.getUserNeeds = async (req, res) => {
  try {
    const userNeeds = await UserNeed.find();
    res.json(userNeeds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user needs' });
  }
};

// Delete User Need
exports.deleteUserNeeds = async (req, res) => {
  try {
    const need = await UserNeed.findByIdAndDelete(req.params.id);
    if (!need) {
      return res.status(404).json({ message: 'User need not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
