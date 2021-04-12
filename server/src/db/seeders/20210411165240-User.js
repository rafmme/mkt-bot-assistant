module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          facebookId: 'ABDERTYY',
          fullName: 'John Doe',
          profilePic: 'https://fjjj.com',
        },
        {
          facebookId: 'ABJERTYY',
          fullName: 'Jane Doe',
          profilePic: 'https://fjjkhj.com',
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
