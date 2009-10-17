JS.Test.extend({
  /** section: test
   * mixin JS.Test.Context
   * 
   * `JS.Test.Context` is a JavaScript version of Context, an extension for
   * `Test::Unit` written by Jeremy McAnally. It provides a DSL for more
   * readable test suites using nestable context blocks with before/after
   * hooks and natural-language test names.
   * 
   * Copyright (c) 2008 Jeremy McAnally
   * 
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   * 
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   **/
  Context: new JS.Module({
    extend: {
      included: function(base) {
        base.extend(JS.Test.Context.Context);
        base.include(JS.Test.Context.LifeCycle);
        base.extend(JS.Test.Context.Test);
      },
      
      /** section: test
       * mixin JS.Text.Context.Context
       **/
      Context: new JS.Module({
        getContextName: function() {
          this._contextName = this._contextName || '';
          return JS.isFn(this.superclass.getContextName)
            ? (this.superclass.getContextName() + ' ' + this._contextName).replace(/^\s+/, '')
            : this.displayName;
        },
        
        setContextName: function(name) {
          this._contextName = name;
        },
        
        /**
         * JS.Text.Context.Context#context(name, block) -> JS.Class
         * 
         * Add a context to a set of tests.
         * 
         *   context("a new account", function() { with(this) {
         *     it("should not have users", function() {
         *       this.assert( new Account().users.empty() );
         *     })
         *   }})
         * 
         * The context name is prepended to the test name, so failures look like this:
         * 
         *   1) Failure:
         *   test a new account should not have users():
         *   <false> is not true.
         * 
         * Contexts can also be nested like so:
         * 
         *   context("a new account", function() { with(this) {
         *     context("created by the web application", function() { with(this) {
         *       it("should have web as its vendor", function() {
         *         this.assertEqual( "web", users('web_user').vendor );
         *       })
         *     }})
         *   }})
         **/
        context: function(name, block) {
          var klass = new JS.Class(this);
          klass.setContextName(name);
          JS.Ruby(klass, block);
          return klass;
        }
      })
    }
  }),
  
  describe: function(name, block) {
    var klass = new JS.Class(name, JS.Test.Unit.TestCase);
    klass.include(JS.Test.Context);
    JS.Ruby(klass, block);
    return klass;
  }
});

JS.Test.Context.Context.include({
  describe: JS.Test.Context.Context.instanceMethod('context')
});

JS.Test.extend({
  context:  JS.Test.describe
});

JS.Test.Unit.TestSuite.include({
  run: function(result, block, context) {
    block.call(context || null, this.klass.STARTED, this._name);
    
    var first = this._tests[0], ivarsFromCallback = null;
    if (first.runAllCallbacks) ivarsFromCallback = first.runAllCallbacks('before');
    
    for (var i = 0, n = this._tests.length; i < n; i++) {
      if (ivarsFromCallback) this._tests[i].setValuesFromCallbacks(ivarsFromCallback);
      this._tests[i].run(result, block, context);
    }
    
    if (ivarsFromCallback) first.runAllCallbacks('after');
    block.call(context || null, this.klass.FINISHED, this._name);
  }
});
