module.exports = function(grunt) {
	grunt.initConfig({

		traceur: {
        	options: {
                sourceMaps: true,
                experimental: true,
                blockBinding: false
            },
            custom: {
                files: {
					'build/spearal.js': [
						'src/SpearalType.js',
						'src/SpearalEncoder.js',
						'src/SpearalDecoder.js'
					]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-traceur');
}