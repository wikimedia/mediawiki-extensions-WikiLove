/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-jsonlint' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		banana: {
			all: [
				'i18n/',
			]
		},
		jsonlint: {
			all: [
				'**/*.json',
				'.stylelintrc',
				'!node_modules/**',
				'!vendor/**'
			]
		},
		stylelint: {
			all: [
				'**/*.css',
				'!node_modules/**',
				'!vendor/**'
			]
		}
	} );

	grunt.registerTask( 'lint', [ 'jsonlint', 'banana', 'stylelint' ] );
	grunt.registerTask( 'test', [ 'lint' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};
