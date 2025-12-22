# @amekusa/util.js
General purpose utility for JS

## INSTALL
```sh
npm i @amekusa/util.js
```

## USAGE

### ES
```js
// Import functions
import {merge, arr, isEmpty} from '@amekusa/util.js';

// Import categories
import {gen, time, web, io, sh} from '@amekusa/util.js';

// Import only browser-compatible categories
import {gen, time, web} from '@amekusa/util.js/browser';
```

### CJS
```js
// Import functions
const {merge, arr, isEmpty} = require('@amekusa/util.js');

// Import categories
const {gen, time, web, io, sh} = require('@amekusa/util.js');

// Import only browser-compatible categories
const {gen, time, web} = require('@amekusa/util.js/browser');
```

### Browser
```html
<script src="amekusa.util.br.js"></script>
<script src="your-script.js"></script>
```

```js
// your-script.js
const {gen, time, web} = amekusa.util;
```

### Browser with module loading
```html
<script type="module" src="your-script.js"></script>
```

```js
// your-script.js
import {gen, time, web} from './amekusa.util.br.es.js';
```

## LICENSE
MIT License

Copyright (c) 2024 Satoshi Soma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
