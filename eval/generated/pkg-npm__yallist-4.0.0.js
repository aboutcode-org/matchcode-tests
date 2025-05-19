
function YallistNode(value, prev, next, list) {
    this.value = value;
    this.prev = prev;
    this.next = next;
    this.list = list;
}

function Yallist(iterable) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (iterable && typeof iterable.forEach === 'function') {
        var self = this;
        iterable.forEach(function(item) {
            self.push(item);
        });
    }
}

Yallist.prototype.push = function(value) {
    var node = new YallistNode(value, this.tail, null, this);
    if (!this.head) this.head = node;
    if (this.tail) this.tail.next = node;
    this.tail = node;
    this.length++;
    return this.length;
};

Yallist.prototype.unshift = function(value) {
    var node = new YallistNode(value, null, this.head, this);
    if (!this.tail) this.tail = node;
    if (this.head) this.head.prev = node;
    this.head = node;
    this.length++;
    return this.length;
};

Yallist.prototype.pop = function() {
    if (!this.tail) return undefined;
    var value = this.tail.value;
    if (this.tail.prev) this.tail.prev.next = null;
    this.tail = this.tail.prev;
    if (this.tail === null) this.head = null;
    this.length--;
    return value;
};

Yallist.prototype.shift = function() {
    if (!this.head) return undefined;
    var value = this.head.value;
    if (this.head.next) this.head.next.prev = null;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    this.length--;
    return value;
};

Yallist.prototype.forEach = function(fn, thisp) {
    thisp = thisp || this;
    for (var walker = this.head, i = 0; walker !== null; walker = walker.next, i++) {
        fn.call(thisp, walker.value, i, this);
    }
};

Yallist.prototype.get = function(n) {
    var i = 0;
    for (var walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
    }
    return walker ? walker.value : undefined;
};

Yallist.prototype.removeNode = function(node) {
    if (node.list !== this) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    node.list = null;
    node.next = null;
    node.prev = null;
    this.length--;
};

module.exports = Yallist;