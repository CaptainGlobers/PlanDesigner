module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks("grunt-tslint");

    grunt.initConfig({
		ts: 
		{
			default: 
			{
				tsconfig: true
			}
		},
		tslint:
		{
			options: {
			  configuration: "tslint.json",
			},
			files: {
			  src: [
				'lib/**/*.ts',
				'demo/**/*.ts'
			  ]
			}
		}
	});
	
    grunt.registerTask('default', ['ts']);
}