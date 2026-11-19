'use strict';

const { defineConfig, globalIgnores } = require( 'eslint/config' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );

// Directories with their own config, which other configs don't apply to.
// These were directories with `"root": true` in .eslintrc.json.
const rootDirs = {
	resources: [ 'resources/**' ],
};

module.exports = defineConfig( [
	globalIgnores( [
		// Build
		'vendor/',

		// Language files written automatically by TranslateWiki
		'**/i18n/**/*.json',
		'!**/i18n/**/en.json',
		'!**/i18n/**/qqq.json',
	] ),

	// Gruntfile.js, etc.
	{
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ) ],
	},
	{
		ignores: [ ...Object.values( rootDirs ).flat(), '**/*.json' ],
		rules: {
			'comma-dangle': [ 'error', 'always-multiline' ],
		},
	},

	// Code which runs in MediaWiki
	{
		files: rootDirs.resources,
		extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
		rules: {
			'no-var': 'error',
			'prefer-const': 'error',
			'comma-dangle': [ 'error', 'always-multiline' ],
		},
	},
] );
