  if (!(this instanceof LRUCache)) return new LRUCache(options);
  options = options || {};
  var max = options.max || 1000;
  var maxAge = options.maxAge || 0;
  var cache = Object.create(null);
  var map = {};
  var head, tail;
  var length = 0;

  function now() {
    return new Date().getTime();
  }

  function remove(node) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (tail === node) tail = node.prev;
    if (head === node) head = node.next;
    node.next = node.prev = undefined;
    delete map[node.key];
    delete cache[node.key];
    length--;
  }

  function unshift(node) {
    node.next = head;
    node.prev = undefined;
    if (head) head.prev = node;
    head = node;
    if (!tail) tail = node;
    map[node.key] = node;
    cache[node.key] = node.value;
    length++;
  }

  function shift() {
    if (!tail) return;
    remove(tail);
  }

  this.get = function (key) {
    var node = map[key];
    if (!node) return undefined;
    if (maxAge && now() - node.now > maxAge) {
      remove(node);
      return undefined;
    }
    remove(node);
    node.now = now();
    unshift(node);
    return node.value;
  };

  this.set = function (key, value) {
    var node = map[key];
    if (node) {
      remove(node);
      node.value = value;
      node.now = now();
    } else {
      node = {
        key: key,
        value: value,
        now: now()
      };
    }
    unshift(node);
    while (length > max) {
      shift();
    }
  };

  this.has = function (key) {
    return !!map[key] &&
      (!maxAge || now() - map[key].now <= maxAge);
  };

  this.del = function (key) {
    if (map[key]) remove(map[key]);
  };

  this.reset = function () {
    cache = Object.create(null);
    map = {};
    head = tail = undefined;
    length = 0;
  };
  
  this.size = function () {
    return length;
  };
}