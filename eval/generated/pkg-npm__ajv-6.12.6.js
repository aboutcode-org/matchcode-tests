  function Ajv(opts){
    if(!(this instanceof Ajv)) return new Ajv(opts);
    this.opts = opts||{};
    this.schemas = {};
    this.refs = {};
    this.formats = {};
  }
  Ajv.prototype.addSchema = function(schema, key){
    key = key || schema.$id || schema.id;
    if(!key) throw new Error('Missing schema id');
    this.schemas[key] = schema;
    return this;
  };
  Ajv.prototype.addFormat = function(name, pattern){
    this.formats[name] = typeof pattern==='function' ? pattern : function(data){return pattern.test(data);};
    return this;
  };
  Ajv.prototype.validate = function(schemaOrKey, data){
    var schema = typeof schemaOrKey==='string' ? this.schemas[schemaOrKey] : schemaOrKey;
    if(!schema) throw new Error('Schema not found');
    return this._validateSchema(schema, data);
  };
  Ajv.prototype._validateSchema = function(schema, data){
    if(schema.type){
      if(!this._checkType(schema.type, data))return false;
    }
    if(schema.enum){
      if(schema.enum.indexOf(data)===-1)return false;
    }
    if(schema.format && this.formats[schema.format]){
      if(!this.formats[schema.format](data))return false;
    }
    if(schema.properties && typeof data==='object'){
      for(var key in schema.properties){
        if(schema.required && schema.required.indexOf(key)!==-1 && !(key in data))return false;
        if(key in data && !this._validateSchema(schema.properties[key], data[key]))return false;
      }
    }
    if(schema.items && Array.isArray(data)){
      for(var i=0;i<data.length;i++){
        if(!this._validateSchema(schema.items, data[i]))return false;
      }
    }
    return true;
  };
  Ajv.prototype._checkType = function(type, data){
    if(Array.isArray(type)){
      for(var i=0;i<type.length;i++){
        if(this._isType(type[i], data)) return true;
      }
      return false;
    }
    return this._isType(type, data);
  };
  Ajv.prototype._isType = function(type, data){
    if(type==='string')return typeof data==='string';
    if(type==='number')return typeof data==='number';
    if(type==='integer')return typeof data==='number' && isFinite(data) && Math.floor(data)===data;
    if(type==='boolean')return typeof data==='boolean';
    if(type==='object')return data&&typeof data==='object'&&!Array.isArray(data);
    if(type==='array')return Array.isArray(data);
    if(type==='null')return data===null;
    return false;
  };
  if(typeof module!=='undefined'&&module.exports){
    module.exports=Ajv;
  }else{
    global.Ajv=Ajv;
  }
})(typeof window!=='undefined'?window:global);