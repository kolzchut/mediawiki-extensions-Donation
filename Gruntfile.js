/* eslint-env node, es6 */
module.exports = function ( grunt ) {
	var conf = grunt.file.readJSON( 'extension.json' );

	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		eslint: {
			options: {
				cache: true,
				fix: grunt.option( 'fix' ) // this will get params from the flags
			},
			all: '.'
		},
		stylelint: {
			all: [
				'**/*.{css,less}',
				'!node_modules/**',
				'!vendor/**'
			],
			options: {
				failOnError: false,
				fix: grunt.option( 'fix' )
			}
		},
		banana: conf.MessagesDirs
	} );

	grunt.registerTask( 'test', [ 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
};
