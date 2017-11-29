module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

    grunt.initConfig({
		ts: {
			default: {
				tsconfig: true
			},
			app: {
			  src: ['demo/App.ts'],
			  out: 'demo/demo.js',
			  options: {
				sourceMap: true,
				module: "system",
				target: "es5",
				moduleResolution: "node",
				noImplicitAny: true,
				noUnusedLocals: true,
				noImplicitReturns: true,
				failOnTypeErrors: true,
				stripInternal: true
			  }
			}
		}
	});
	
    grunt.registerTask('default', ['ts']);
	grunt.registerTask('app', ['ts: app']);
}