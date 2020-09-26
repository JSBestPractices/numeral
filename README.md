# Numeral

Numeral is a standard Deno module for formatting and manipulating numbers.

## 🔧 How to use

```js
import { numeral } from 'https://deno.land/x/numeral@v0.1.0/mod.ts';
```
## 💡 Usage

### 🎀 Create

Create an instance of a numeral. Numeral takes numbers or strings that it trys to convert into a number.

```js
const myNumeral = numeral(1000);

const value = myNumeral.value();
// 1000

const myNumeral2 = numeral('1,000');

const value2 = myNumeral2.value();
// 1000
```

| Input                 | Value         |
|-----------------------|---------------|
| numeral(974)          | 974           |
| numeral(0.12345)      | 0.12345       |
| numeral('10,000.12')  | 10000.12      |
| numeral('23rd')       | 23            |
| numeral('$10,000.00') | 10000         |
| numeral('100B')       | 100           |
| numeral('3.467TB')    | 3467000000000 |
| numeral('-76%')       | -0.76         |
| numeral('2:23:57')    | NaN           |

### 🎀 Format

Numbers can be formatted to look like currency, percentages, times, or even plain old numbers with decimal places, thousands, and abbreviations.

```js
const string = numeral(1000).format('0,0');
// '1,000'
```

#### Numbers

| Number     | Format       | String        |
|------------|--------------|---------------|
| 10000      | '0,0.0000'   | 10,000.0000   |
| 10000.23   | '0,0'        | 10,000        |
| 10000.23   | '+0,0'       | +10,000       |
| -10000     | '0,0.0'      | -10,000.0     |
| 10000.1234 | '0.000'      | 10000.123     |
| 100.1234   | '00000'      | 00100         |
| 1000.1234  | '000000,0'   | 001,000       |
| 10         | '000.00'     | 010.00        |
| 10000.1234 | '0[.]00000'  | 10000.12340   |
| -10000     | '(0,0.0000)' | (10,000.0000) |
| -0.23      | '.00'        | -.23          |
| -0.23      | '(.00)'      | (.23)         |
| 0.23       | '0.00000'    | 0.23000       |
| 0.23       | '0.0[0000]'  | 0.23          |
| 1230974    | '0.0a'       | 1.2m          |
| 1460       | '0 a'        | 1 k           |
| -104000    | '0a'         | -104k         |
| 1          | '0o'         | 1st           |
| 100        | '0o'         | 100th         |

#### Currency

| Number    | Format       | String     |
|-----------|--------------|------------|
| 1000.234  | '$0,0.00'    | $1,000.23  |
| 1000.2    | '0,0[.]00 $' | 1,000.20 $ |
| 1001      | '$ 0,0[.]00' | $ 1,001    |
| -1000.234 | '($0,0)'     | ($1,000)   |
| -1000.234 | '$0.00'      | -$1000.23  |
| 1230974   | '($ 0.00 a)' | $ 1.23 m   |

#### Bytes

| Number        | Format     | String    |
|---------------|------------|-----------|
| 100           | '0b'       | 100B      |
| 1024          | '0b'       | 1KB       |
| 2048          | '0 ib'     | 2 KiB     |
| 3072          | '0.0 b'    | 3.1 KB    |
| 7884486213    | '0.00b'    | 7.88GB    |
| 3467479682787 | '0.000 ib' | 3.154 TiB |

## ❗ Issues

If you think any of the `Numeral` can be improved, please do open a PR with any updates and submit any issues. Also, I will continue to improve this, so you might want to watch/star this repository to revisit.

## 💪 Contribution

We'd love to have your helping hand on contributions to `Numeral` by forking and sending a pull request!

Your contributions are heartily ♡ welcome, recognized and appreciated. (✿◠‿◠)

How to contribute:

- Open pull request with improvements
- Discuss ideas in issues
- Spread the word
- Reach out with any feedback

## ⚖️ License

The MIT License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
