let numeral: any,
  _,
  VERSION: string = '0.1.0',
  formats: any = {},
  locales: any = {},
  defaults: any = {
    currentLocale: "en",
    zeroFormat: null,
    nullFormat: null,
    defaultFormat: "0,0",
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
      for (kind in formats) {
        regexp =
          typeof formats[kind].regexps.unformat === "function"
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

  for (kind in formats) {
    console.log(kind);
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

    // see if we should use parentheses for negative number or 
    // if we should prefix with a sign
    // if both are present we default to parentheses
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

    // see if abbreviation is wanted
    if (numeral._.includes(format, 'a')) {
      abbrForce = format.match(/a(k|m|b|t)?/);

      abbrForce = abbrForce ? abbrForce[1] : false;

      // check for space before abbreviation
      if (numeral._.includes(format, ' a')) {
        abbr = ' ';
      }

      format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '');

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

      // check for optional decimals
      if (numeral._.includes(format, '[.]')) {
        optDec = true;
        format = format.replace('[.]', '.');
      }

      // break number and format
      int = value.toString().split('.')[0];
      precision = format.split('.')[1];
      thousands = format.indexOf(',');
      leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || []).length;

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

      // check abbreviation again after rounding
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

      // format number
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
    }
  },
  isNaN: function (value: any) {
    return typeof value === "number" && isNaN(value);
  },
  includes: function(string: string, search: any) {
    return string.indexOf(search) !== -1;
  },
};

// This function sets the current locale
// If no arguments are passed in
// it will simply return the current global locale key
numeral.locale = function(key: string) {
  if (key) {
    options.currentLocale = key.toLowerCase();
  }
  return options.currentLocale;
};

// This function provides access to the loaded locale data
// If no arguments are passed in, it will simply return the current
// global locale object
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
  for (var property in defaults) {
    options[property] = defaults[property];
  }
};
