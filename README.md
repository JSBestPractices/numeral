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
let myNumeral = numeral(1000);

let value = myNumeral.value();
// 1000

let myNumeral2 = numeral('1,000');

let value2 = myNumeral2.value();
// 1000
```

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
