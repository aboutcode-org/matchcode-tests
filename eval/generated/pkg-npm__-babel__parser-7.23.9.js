(function(global){
  function Lexer(input) {
    this.input = input;
    this.pos = 0;
    this.length = input.length;
  }
  Lexer.prototype.next = function() {
    if(this.pos >= this.length) return null;
    var c = this.input[this.pos++];
    while(/\s/.test(c)) {
      if(this.pos >= this.length) return null;
      c = this.input[this.pos++];
    }
    if(/[a-zA-Z_$]/.test(c)) {
      var id = c;
      while(this.pos < this.length && /[a-zA-Z0-9_$]/.test(this.input[this.pos])) {
        id += this.input[this.pos++];
      }
      return {type: "Identifier", value: id};
    }
    if(/[0-9]/.test(c)) {
      var num = c;
      while(this.pos < this.length && /[0-9]/.test(this.input[this.pos])) {
        num += this.input[this.pos++];
      }
      return {type: "Numeric", value: num};
    }
    if(c === '"' || c === "'") {
      var quote = c, str = "";
      while(this.pos < this.length) {
        c = this.input[this.pos++];
        if(c === quote) break;
        if(c === '\\' && this.pos < this.length) {
          str += c + this.input[this.pos++];
        } else {
          str += c;
        }
      }
      return {type: "String", value: str};
    }
    var single = "{}()[],;.".indexOf(c) !== -1;
    if(single) {
      return {type: "Punctuator", value: c};
    }
    return {type: "Unknown", value: c};
  };
  function Parser(input) {
    this.lexer = new Lexer(input);
    this.lookahead = this.lexer.next();
  }
  Parser.prototype.eat = function(type) {
    if(this.lookahead && this.lookahead.type === type) {
      var val = this.lookahead;
      this.lookahead = this.lexer.next();
      return val;
    }
    return null;
  };
  Parser.prototype.parseIdentifier = function() {
    var id = this.eat("Identifier");
    if(id) return {type: "Identifier", name: id.value};
    return null;
  };
  Parser.prototype.parsePrimary = function() {
    if(this.lookahead.type === "Identifier") {
      return this.parseIdentifier();
    }
    if(this.lookahead.type === "Numeric") {
      var num = this.eat("Numeric");
      return {type: "Literal", value: Number(num.value)};
    }
    if(this.lookahead.type === "String") {
      var str = this.eat("String");
      return {type: "Literal", value: str.value};
    }
    if(this.lookahead.type === "Punctuator" && this.lookahead.value === "(") {
      this.eat("Punctuator");
      var expr = this.parseExpression();
      this.eat("Punctuator");
      return expr;
    }
    return null;
  };
  Parser.prototype.parseExpression = function() {
    var left = this.parsePrimary();
    if(!left) return null;
    while(this.lookahead && this.lookahead.type === "Punctuator" && this.lookahead.value === ".") {
      this.eat("Punctuator");
      var prop = this.parseIdentifier();
      left = {type: "MemberExpression", object: left, property: prop};
    }
    return left;
  };
  Parser.prototype.parse = function() {
    var program = {type: "Program", body: []};
    while(this.lookahead) {
      var expr = this.parseExpression();
      if(expr) program.body.push(expr);
      if(this.lookahead && this.lookahead.type === "Punctuator" && this.lookahead.value === ";") {
        this.eat("Punctuator");
      }
    }
    return program;
  };
  global.SimpleParser = Parser;
})(this);