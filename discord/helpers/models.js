const { Sequelize } = require('sequelize');

/*
 * Sequelize connection
 *
 * Connects to a MariaDB instance using credentials from environment
 * variables (loaded by dotenv in app.js and validated by Joi before
 * this module is required). Query logging is disabled to keep the
 * console clean during normal operation.
 */
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mariadb',
	logging: false,
});

/*
 * UserPreferences model
 *
 * Stores per-user translation settings. Each row is keyed by the user's
 * Discord snowflake ID (a string, not a bigint, to avoid JS precision
 * issues). The `lang` column holds an ISO 639-1 code (2–3 chars) for
 * the user's preferred translation target language.
 *
 * The remaining columns (guilds, ignoredUsers, ignoredLanguages, etc.)
 * are reserved for future filtering features. They store comma-separated
 * values in a single STRING column. Custom getters split them into arrays
 * on read, and custom setters join arrays back into strings on write.
 *
 * Getters are null-safe — a null or empty DB value returns an empty
 * array rather than crashing on `null.split()`. Setters accept either
 * an array (joined with commas) or a raw string (stored as-is).
 *
 * Timestamps are disabled since we don't need createdAt/updatedAt.
 */
const UserPreferences = sequelize.define(
	'userPreferences',
	{
		id: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
		guilds: Sequelize.STRING,
		lang: Sequelize.STRING(3),
		ignoredUsers: Sequelize.STRING,
		ignoredLanguages: Sequelize.STRING,
		ignoredChannels: Sequelize.STRING,
		ignoredCategories: Sequelize.STRING,
		ignoredGuilds: Sequelize.STRING,
	},
	{
		Sequelize,
		modelName: 'userPreferences',
		timestamps: false,
		getterMethods: {
			guilds() {
				const val = this.getDataValue('guilds');
				return val ? val.split(',') : [];
			},
			ignoredUsers() {
				const val = this.getDataValue('ignoredUsers');
				return val ? val.split(',') : [];
			},
			ignoredLanguages() {
				const val = this.getDataValue('ignoredLanguages');
				return val ? val.split(',') : [];
			},
			ignoredChannels() {
				const val = this.getDataValue('ignoredChannels');
				return val ? val.split(',') : [];
			},
			ignoredCategories() {
				const val = this.getDataValue('ignoredCategories');
				return val ? val.split(',') : [];
			},
			ignoredGuilds() {
				const val = this.getDataValue('ignoredGuilds');
				return val ? val.split(',') : [];
			},
		},
		setterMethods: {
			guilds(value) {
				this.setDataValue('guilds', Array.isArray(value) ? value.join(',') : value);
			},
			ignoredUsers(value) {
				this.setDataValue('ignoredUsers', Array.isArray(value) ? value.join(',') : value);
			},
			ignoredLanguages(value) {
				this.setDataValue('ignoredLanguages', Array.isArray(value) ? value.join(',') : value);
			},
			ignoredChannels(value) {
				this.setDataValue('ignoredChannels', Array.isArray(value) ? value.join(',') : value);
			},
			ignoredCategories(value) {
				this.setDataValue('ignoredCategories', Array.isArray(value) ? value.join(',') : value);
			},
			ignoredGuilds(value) {
				this.setDataValue('ignoredGuilds', Array.isArray(value) ? value.join(',') : value);
			},
		},
	},
);

/*
 * Connection test & schema sync
 *
 * authenticate() verifies the DB credentials are valid. On success,
 * sync({ alter: true }) applies any column additions or type changes
 * to the existing table without dropping it. Note: `alter: true` can
 * be destructive on column renames — consider migrations for production.
 */
sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
		UserPreferences.sync({ alter: true, force: false });
	})
	.catch((err) => {
		console.error('Unable to connect to the database:', err);
	});

module.exports = { UserPreferences };
