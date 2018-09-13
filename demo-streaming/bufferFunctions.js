function concatTypedArrays(a, b, maxlength) { // a and b are same type

    if (a.length + b.length > maxlength) {
      console.log("too big!!");
    }

    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}
