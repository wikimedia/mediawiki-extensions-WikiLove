'use strict';

module.exports = function ( grunt ) {
	const conf = grunt.file.readJSON( 'extension.json' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		banana: {
			options: {
				requireLowerCase: false,
			},
			...conf.MessagesDirs,
		},
		eslint: {
			options: {
				cache: true,
				fix: grunt.option( 'fix' ),
			},
			all: [
				'**/*.{js,json,vue}',
				'!node_modules/**',
				'!vendor/**',
			],
		},
		stylelint: {
			options: {
				cache: true,
			},
			all: [
				'**/*.{css,less,vue}',
				'!node_modules/**',
				'!vendor/**',
			],
		},
	} );

	grunt.registerTask( 'lint', [ 'banana', 'eslint', 'stylelint' ] );
	grunt.registerTask( 'test', [ 'lint' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};
