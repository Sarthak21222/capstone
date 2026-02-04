router.get('/dashboard-summary', async (req, res) => {
  try {
    const basicCount = await User.count({ where: { plan: 'basic' } });
    const premiumCount = await User.count({ where: { plan: 'premium' } });
    const recentTransactions = await Subscription.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['email'] }]
    });

    res.json({ basicCount, premiumCount, recentTransactions });
  } catch (err) {
    res.status(500).send(err.message);
  }
});