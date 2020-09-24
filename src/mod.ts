let numeral: any,
  _,
  VERSION: string = '0.1.0',
  formats: any = {},
  locales: any = {},
  defaults: any = {
    currentLocale: 'en',
    zeroFormat: null,
    nullFormat: null,
    defaultFormat: '0,0',
    scalePercentBy100: true,
  },
  options: any = {
    currentLocale: defaults.currentLocale,
    zeroFormat: defaults.zeroFormat,
    nullFormat: defaults.nullFormat,
    defaultFormat: defaults.defaultFormat,
    scalePercentBy100: defaults.scalePercentBy100,
  };

function instanceOfNumeral(object: any): object is Numeral {
  return 'input' in object || 'value' in object;
}

export interface INumeralImplements {
  clone?: () => any;
  format?: (inputString: string, roundingFunction: (x: number) => number) => any;
  value?: () => any;
  input?: () => any;
  set?: (value: any) => any;
  add?: (value: any) => any;
  subtract?: (value: any) => any;
  multiply?: (value: any) => any;
  divide?: (value: any) => any;
  difference?: (value: any) => any;
}

class Numeral implements INumeralImplements {
  _input: any;
  _value: number;
  clone?: () => any;
  format?: (inputString: string, roundingFunction: (x: number) => number) => any;
  value?: () => any;
  input?: () => any;
  set?: (value: any) => any;
  add?: (value: any) => any;
  subtract?: (value: any) => any;
  multiply?: (value: any) => any;
  divide?: (value: any) => any;
  difference?: (value: any) => any;

  constructor(input: any, number: number) {
    this._input = input;
    this._value = number;
  }
}

numeral = function(input: any): Numeral {
  let value,
    kind,
    unformatFunction,
    regexp;
  
  if (numeral.isNumeral(input)) {
    value = input.value();
  } else if (input === 0 || typeof input === 'undefined') {
    value = 0;
  } else if (input === null || numeral._.isNaN(input)) {
    value = null;
  } else if (typeof input === 'string') {
    if (options.zeroFormat && input === options.zeroFormat) {
      value = 0;
    } else if (
      (options.nullFormat && input === options.nullFormat) ||
      !input.replace(/[^0-9]+/g, '').length
    ) {
      value = null;
    } else {
      for (kind in formats) {
        regexp =
          typeof formats[kind].regexps.unformat === 'function'
            ? formats[kind].regexps.unformat()
            : formats[kind].regexps.unformat;
        if (regexp && input.match(regexp)) {
          unformatFunction = formats[kind].unformat;
          break;
        }
      }
      unformatFunction = unformatFunction || numeral._.stringToNumber;
      value = unformatFunction(input);
    }
  } else {
    value = Number(input)|| null;
  }

  return new Numeral(input, value);
}

numeral.version = VERSION;

numeral.isNumeral = function(obj: any) {
  return obj instanceof Numeral;
};

numeral.options = options;

numeral.formats = formats;

numeral.locales = locales;

numeral._ = _ = {
  numberToFormat: function (
    value: any,
    format: any,
    roundingFunction: () => void
  ) {
    let locale = locales[numeral.options.currentLocale],
      negP: boolean = false,
      optDec: boolean = false,
      leadingCount: number = 0,
      abbr: string = '',
      trillion: number = 1000000000000,
      billion: number = 1000000000,
      million: number = 1000000,
      thousand: number = 1000,
      decimal: string = '',
      neg: boolean = false,
      abbrForce,
      abs: number,
      min,
      max,
      power,
      int,
      precision,
      signed,
      thousands,
      output;

    value = value || 0;

    abs = Math.abs(value);

    if (numeral._.includes(format, "(")) {
      negP = true;
      format = format.replace(/[\(|\)]/g, "");
    } else if (numeral._.includes(format, "+") || numeral._.includes(format, "-")) {
      signed = numeral._.includes(format, "+")
        ? format.indexOf("+")
        : value < 0
        ? format.indexOf("-")
        : -1;
      format = format.replace(/[\+|\-]/g, "");
    }

    if (numeral._.includes(format, "a")) {
      abbrForce = format.match(/a(k|m|b|t)?/);

      abbrForce = abbrForce ? abbrForce[1] : false;

      if (numeral._.includes(format, " a")) {
        abbr = " ";
      }

      format = format.replace(new RegExp(abbr + "a[kmbt]?"), "");

      if ((abs >= trillion && !abbrForce) || abbrForce === "t") {
        // trillion
        abbr += locale.abbreviations.trillion;
        value = value / trillion;
      } else if (
        (abs < trillion && abs >= billion && !abbrForce) ||
        abbrForce === "b"
      ) {
        // billion
        abbr += locale.abbreviations.billion;
        value = value / billion;
      } else if (
        (abs < billion && abs >= million && !abbrForce) ||
        abbrForce === "m"
      ) {
        // million
        abbr += locale.abbreviations.million;
        value = value / million;
      } else if (
        (abs < million && abs >= thousand && !abbrForce) ||
        abbrForce === "k"
      ) {
        // thousand
        abbr += locale.abbreviations.thousand;
        value = value / thousand;
      }
    }

    if (numeral._.includes(format, "[.]")) {
      optDec = true;
      format = format.replace("[.]", ".");
    }

    int = value.toString().split(".")[0];
    precision = format.split(".")[1];
    thousands = format.indexOf(",");
    leadingCount = (format.split(".")[0].split(",")[0].match(/0/g) || []).length;

    if (precision) {
      if (numeral._.includes(precision, "[")) {
        precision = precision.replace("]", "");
        precision = precision.split("[");
        decimal = numeral._.toFixed(
          value,
          precision[0].length + precision[1].length,
          roundingFunction,
          precision[1].length
        );
      } else {
        decimal = numeral._.toFixed(value, precision.length, roundingFunction);
      }
    
      int = decimal.split(".")[0];
    
      if (numeral._.includes(decimal, ".")) {
        decimal = locale.delimiters.decimal + decimal.split(".")[1];
      } else {
        decimal = "";
      }
    
      if (optDec && Number(decimal.slice(1)) === 0) {
        decimal = "";
      }
    } else {
      int = numeral._.toFixed(value, 0, roundingFunction);
    }

    if (
      abbr &&
      !abbrForce &&
      Number(int) >= 1000 &&
      abbr !== locale.abbreviations.trillion
    ) {
      int = String(Number(int) / 1000);

      switch (abbr) {
        case locale.abbreviations.thousand:
          abbr = locale.abbreviations.million;
          break;
        case locale.abbreviations.million:
          abbr = locale.abbreviations.billion;
          break;
        case locale.abbreviations.billion:
          abbr = locale.abbreviations.trillion;
          break;
      }
    }

    if (numeral._.includes(int, "-")) {
      int = int.slice(1);
      neg = true;
    }

    if (int.length < leadingCount) {
      for (var i = leadingCount - int.length; i > 0; i--) {
        int = "0" + int;
      }
    }

    if (thousands > -1) {
      int = int
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + locale.delimiters.thousands);
    }

    if (format.indexOf(".") === 0) {
      int = "";
    }

    output = int + decimal + (abbr ? abbr : "");

    if (negP) {
      output = (negP && neg ? "(" : "") + output + (negP && neg ? ")" : "");
    } else {
      if (signed >= 0) {
        output =
          signed === 0 ? (neg ? "-" : "+") + output : output + (neg ? "-" : "+");
      } else if (neg) {
        output = "-" + output;
      }
    }

    return output;

  },
  stringToNumber: function(string: string) {
    let locale = locales[options.currentLocale],
      stringOriginal = string,
      abbreviations = {
        thousand: 3,
        million: 6,
        billion: 9,
        trillion: 12,
      },
      abbreviation,
      value,
      i,
      regexp;

    if (options.zeroFormat && string === options.zeroFormat) {
      value = 0;
    } else if (
      (options.nullFormat && string === options.nullFormat) ||
      !string.replace(/[^0-9]+/g, "").length
    ) {
      value = null;
    } else {
      value = 1;
    
      if (locale.delimiters.decimal !== ".") {
        string = string.replace(/\./g, "").replace(locale.delimiters.decimal, ".");
      }
    
      for (abbreviation in abbreviations) {
        regexp = new RegExp(
          "[^a-zA-Z]" +
            locale.abbreviations[abbreviation] +
            "(?:\\)|(\\" +
            locale.currency.symbol +
            ")?(?:\\))?)?$"
        );
    
        if (stringOriginal.match(regexp)) {
          value *= Math.pow(10, abbreviations[abbreviation as keyof typeof abbreviations]);
          break;
        }
      }
    
      value *=
        (string.split("-").length +
          Math.min(string.split("(").length - 1, string.split(")").length - 1)) %
        2
          ? 1
          : -1;
    
      string = string.replace(/[^0-9\.]+/g, "");
    
      value *= Number(string);
    }
    
    return value;
  },
  isNaN: function (value: any) {
    return typeof value === 'number' && isNaN(value);
  },
  includes: function(string: string, search: any) {
    return string.indexOf(search) !== -1;
  },
  insert: function(string: string, subString: string, start: any) {
    return string.slice(0, start) + subString + string.slice(start);
  },
  reduce: function(array: any[], callback: (value: any, t1: any, k: number, t2: any) => void /*, initialValue*/) {
    if (this === null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    
    let t = Object(array),
      len = t.length >>> 0,
      k = 0,
      value;

    if (arguments.length === 3) {
      value = arguments[2];
    } else {
      while (k < len && !(k in t)) {
        k++;
      }
    
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
    
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  },
  multiplier: function (x: string) {
    let parts = x.toString().split('.');
    return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
  },
  correctionFactor: function () {
    let args = Array.prototype.slice.call(arguments);

    return args.reduce(function(accum, next) {
      let mn = numeral._.multiplier(next);
      return accum > mn ? accum : mn;
    }, 1);
  },
  toFixed: function(
    value: any,
    maxDecimals: number,
    roundingFunction: (value: string) => any,
    optionals: any
  ) {
    let splitValue = value.toString().split('.'),
      minDecimals = maxDecimals - (optionals || 0),
      boundedPrecision,
      optionalsRegExp,
      power,
      output;

    if (splitValue.length === 2) {
      boundedPrecision = Math.min(
        Math.max(splitValue[1].length, minDecimals),
        maxDecimals
      );
    } else {
      boundedPrecision = minDecimals;
    }

    power = Math.pow(10, boundedPrecision);

    output = (roundingFunction(value + 'e+' + boundedPrecision) / power).toFixed(
      boundedPrecision
    );

    if (optionals > maxDecimals - boundedPrecision) {
      optionalsRegExp = new RegExp(
        '\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$'
      );
      output = output.replace(optionalsRegExp, '');
    }

    return output;
  },
};

numeral.locale = function(key: string) {
  if (key) {
    options.currentLocale = key.toLowerCase();
  }
  return options.currentLocale;
};

numeral.localeData = function(key: string) {
  if (!key) {
    return locales[options.currentLocale];
  }
  key = key.toLowerCase();
  if (!locales[key]) {
    throw new Error('Unknown locale : ' + key);
  }
  return locales[key];
};

numeral.reset = function() {
  for (let property in defaults) {
    options[property] = defaults[property];
  }
};

numeral.zeroFormat = function(format: any) {
  options.zeroFormat = typeof(format) === 'string' ? format : null;
};

numeral.nullFormat = function (format: any) {
  options.nullFormat = typeof(format) === 'string' ? format : null;
};

numeral.defaultFormat = function(format: any) {
  options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
};

numeral.register = function(type: any, name: string, format: any) {
  name = name.toLowerCase();

  if (this[type + 's'][name]) {
    throw new TypeError(name + ' ' + type + ' already registered.');
  }

  this[type + 's'][name] = format;

  return format;
};

numeral.validate = function(val: any, culture: any) {
  let _decimalSep,
    _thousandSep,
    _currSymbol,
    _valArray,
    _abbrObj,
    _thousandRegEx,
    localeData,
    temp;

  if (typeof val !== 'string') {
    val += '';

    if (console.warn) {
      console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
    }
  }

  val = val.trim();

  if (!!val.match(/^\d+$/)) {
    return true;
  }

  if (val === '') {
    return false;
  }

  try {
    localeData = numeral.localeData(culture);
  } catch (e) {
    localeData = numeral.localeData(numeral.locale());
  }

  _currSymbol = localeData.currency.symbol;
  _abbrObj = localeData.abbreviations;
  _decimalSep = localeData.delimiters.decimal;
  if (localeData.delimiters.thousands === '.') {
    _thousandSep = '\\.';
  } else {
    _thousandSep = localeData.delimiters.thousands;
  }

   temp = val.match(/^[^\d]+/);
   if (temp !== null) {
     val = val.substr(1);
     if (temp[0] !== _currSymbol) {
       return false;
     }
   }

  temp = val.match(/[^\d]+$/);
  if (temp !== null) {
    val = val.slice(0, -1);
    if (
      temp[0] !== _abbrObj.thousand &&
      temp[0] !== _abbrObj.million &&
      temp[0] !== _abbrObj.billion &&
      temp[0] !== _abbrObj.trillion
    ) {
      return false;
    }
  }

  _thousandRegEx = new RegExp(_thousandSep + '{2}');

  if (!val.match(/[^\d.,]/g)) {
    _valArray = val.split(_decimalSep);
    if (_valArray.length > 2) {
      return false;
    } else {
      if (_valArray.length < 2) {
        return (
          !!_valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx)
        );
      } else {
        if (_valArray[0].length === 1) {
          return (
            !!_valArray[0].match(/^\d+$/) &&
            !_valArray[0].match(_thousandRegEx) &&
            !!_valArray[1].match(/^\d+$/)
          );
        } else {
          return (
            !!_valArray[0].match(/^\d+.*\d$/) &&
            !_valArray[0].match(_thousandRegEx) &&
            !!_valArray[1].match(/^\d+$/)
          );
        }
      }
    }
  }

  return false;
}

Numeral.prototype.clone = function (): any {
  return numeral(this);
};

Numeral.prototype.format = function (
  inputString: string,
  roundingFunction: (x: number) => number
): any {
  let value = this._value,
    format = inputString || options.defaultFormat,
    kind,
    output,
    formatFunction;

  // make sure we have a roundingFunction
  roundingFunction = roundingFunction || Math.round;

  // format based on value
  if (value === 0 && options.zeroFormat !== null) {
    output = options.zeroFormat;
  } else if (value === null && options.nullFormat !== null) {
    output = options.nullFormat;
  } else {
    for (kind in formats) {
      if (format.match(formats[kind].regexps.format)) {
        formatFunction = formats[kind].format;

        break;
      }
    }

    formatFunction = formatFunction || numeral._.numberToFormat;

    output = formatFunction(value, format, roundingFunction);
  }

  return output;
};

Numeral.prototype.value = function (): any {
  return this._value;
};

Numeral.prototype.input = function (): any {
  return this._input;
};

Numeral.prototype.set = function (value: any): any {
  this._value = Number(value);
  return this;
};

Numeral.prototype.add = function(value: any): Numeral {
  let corrFactor = numeral._.correctionFactor.call(null, this._value, value);

  function cback(accum: number, curr: number, currI: number, O: number) {
      return accum + Math.round(corrFactor * curr);
  }

  this._value = numeral._.reduce([this._value, value], cback, 0) / corrFactor;

  return this;
};

Numeral.prototype.subtract = function(value: any) {
  let corrFactor = numeral._.correctionFactor.call(null, this._value, value);

  function cback(accum: number, curr: number, currI: number, O: number) {
    return accum - Math.round(corrFactor * curr);
  }

  this._value =
    numeral._.reduce([value], cback, Math.round(this._value * corrFactor)) / corrFactor;

  return this;
};

Numeral.prototype.multiply = function(value: any) {
  function cback(accum: number, curr: number, currI: number, O: number) {
    let corrFactor = numeral._.correctionFactor(accum, curr);
    return (
      (Math.round(accum * corrFactor) * Math.round(curr * corrFactor)) /
      Math.round(corrFactor * corrFactor)
    );
  }
  
  this._value = numeral._.reduce([this._value, value], cback, 1);
  
  return this;
};

Numeral.prototype.divide = function(value: any) {
  function cback(accum: number, curr: number, currI: number, O: number) {
    let corrFactor = numeral._.correctionFactor(accum, curr);
    return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
  }
  
  this._value = numeral._.reduce([this._value, value], cback);
  
  return this;
};

Numeral.prototype.difference = function(value: any) {
  return Math.abs(numeral(this._value).subtract(value).value());
};

numeral.fn = Numeral.prototype;

numeral.register('locale', 'en', {
  delimiters: {
    thousands: ',',
    decimal: '.',
  },
  abbreviations: {
    thousand: 'k',
    million: 'm',
    billion: 'b',
    trillion: 't',
  },
  ordinal: function (number: number) {
    let b = number % 10;
    return ~~((number % 100) / 10) === 1
      ? 'th'
      : b === 1
      ? 'st'
      : b === 2
      ? 'nd'
      : b === 3
      ? 'rd'
      : 'th';
  },
  currency: {
    symbol: '$',
  },
});

export default numeral;
