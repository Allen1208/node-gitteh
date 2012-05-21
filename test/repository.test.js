/*
 * The MIT License
 *
 * Copyright (c) 2010 Sam Day
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
 var vows = require("vows"),
	assert = require("assert"),
	temp = require("temp"),
	gitteh = require("../lib/gitteh"),
	path = require("path"),
	fixtureValues = require("./fixtures/values");

var existingBareRepoVows = function(topic) {
	return {
		topic: topic,
		"opens correctly": function(repo) {
			assert.instanceOf(repo, gitteh.Repository);
		},
		"is definitely bare": function(repo) {
			assert.isTrue(repo.bare);
		},
		"repo has correct path": function(repo) {
			assert.equal(repo.path, fixtureValues.REPO_PATH);
		},
		"repo path is immutable": function(repo) {
			repo.path = "foo";
			assert.equal(repo.path, fixtureValues.REPO_PATH);
		},
		/*"Commits are not redundant": function(repo) {
			assert.isTrue(repo.getCommit(fixtureValues.FIRST_COMMIT.id) === repo.getCommit(fixtureValues.FIRST_COMMIT.id));
		},*/
		"Exists() *asynchronously*": {
			topic: function(repo) {
				repo.exists(fixtureValues.FIRST_COMMIT.id, this.callback);
			},
			
			"works correctly": function(result) {
				assert.isTrue(result);
			}
		},
		"Exists() *synchronously*": function(repo) {
			assert.isTrue(repo.exists(fixtureValues.FIRST_COMMIT.id));
		}
	}
}

vows.describe("Repository").addBatch({
	"Opening an existing bare repository *synchronously*": existingBareRepoVows(function() {	
		var repo = gitteh.openRepository(fixtureValues.REPO_PATH);	
		return repo;
	}),
	"Opening an existing bare repository *asynchronously*": existingBareRepoVows(function() {
		gitteh.openRepository(fixtureValues.REPO_PATH, this.callback);
	}),

	"Opening a non-existent repository *synchronously*": {
		topic: function() {
			return gitteh.openRepository("/no/git/repo/here/");
		},

		"fails with an Exception": function(err) {
			assert.instanceOf(err, Error);
		}
	},

	"Opening a non-existent repository *asynchronously*": {
		topic: function() {
			gitteh.openRepository("/no/git/repo/here/", function(err) {
				this(null, err);
			}.bind(this.callback));
		},

		"fails with an Exception": function(err) {
			assert.instanceOf(err, Error);
		}
	},
	
	/*
	"Opening a repository with custom options *asynchronously*": {
		topic: function() {
			gitteh.openRepository(fixtureValues.WORKING_DIR, this.callback);
		},
		
		"gives us a Repository": function(repo) {
			assert.isTrue(!!repo);
		},
		
		"with correct path": function(repo) {
			assert.equal(repo.path, fixtureValues.WORKING_DIR.gitDirectory);
		}
	},
	
	"Opening a repository with custom options *synchronously*": {
		topic: function() {
			return gitteh.openRepository(fixtureValues.WORKING_DIR);
		},
		
		"gives us a Repository": function(repo) {
			assert.isTrue(!!repo);
		},
		
		"with correct path": function(repo) {
			assert.equal(repo.path, fixtureValues.WORKING_DIR.gitDirectory);
		}
	}*/

	// TODO: probably nice to clean these up afterwards even though they're temp
	"Initializing a new bare repository *asynchronously*": {
		topic: function() {
			var path = this.context.path = temp.path() + "/";
			gitteh.initRepository(path, true, this.callback);
		},

		"gives us a Repository": function(repo) {
			assert.instanceOf(repo, gitteh.Repository);
		},

		"is bare": function(repo) {
			assert.isTrue(repo.bare);
		},

		"has the correct path": function(repo) {
			assert.equal(repo.path, this.context.path);
		}
	}
}).export(module);
