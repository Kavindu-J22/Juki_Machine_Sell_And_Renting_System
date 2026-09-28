const CompanySettings = require('../models/CompanySettings');

// @desc    Get company settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      // Auto-create default settings if none exist
      settings = await CompanySettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching company settings'
    });
  }
};

// @desc    Update company settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = await CompanySettings.create(req.body);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Company settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating company settings'
    });
  }
};
