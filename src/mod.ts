let numeral: any,
  _,
  VERSION = "0.1.0",
  formats = {},
  locales = {},
  defaults = {
    currentLocale: "en",
    zeroFormat: null,
    nullFormat: null,
    defaultFormat: "0,0",
    scalePercentBy100: true,
  },
  options = {
    currentLocale: defaults.currentLocale,
    zeroFormat: defaults.zeroFormat,
    nullFormat: defaults.nullFormat,
    defaultFormat: defaults.defaultFormat,
    scalePercentBy100: defaults.scalePercentBy100,
  };

function instanceOfNumeral(object: any): object is Numeral {
  return 'input' in object || 'value' in object;
}

class Numeral {
  _input: any;
  _value: number;

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
    } else if (options.nullFormat && input === options.nullFormat || !input.replace(/[^0-9]+/g, '').length) {
      value = null;
    } else {
      // for (kind in formats) {
      //   regexp =
      //     typeof formats[kind].regexps.unformat === "function"
      //       ? formats[kind].regexps.unformat()
      //       : formats[kind].regexps.unformat;
      //   if (regexp && input.match(regexp)) {
      //     unformatFunction = formats[kind].unformat;
      //     break;
      //   }
      // }
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
    
    // make sure we never format a null value
    value = value || 0;

    abs = Math.abs(value);
  },
  isNaN: function (value: any) {
    return typeof value === "number" && isNaN(value);
  },
};

// This function sets the current locale
// If no arguments are passed in
// it will simply return the current global locale key
numeral.locale = function(key) {
  if (key) {
      options.currentLocale = key.toLowerCase();
  }
  return options.currentLocale;
};
