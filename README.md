# jQuery column freeze plugin

Freeze table columns in place.

## Requirements

Requires [`jquery-tableslice`][tableslice] and [`jquery-tablesplit`][tablesplit].

## Installing

With [Bower][bower]:

```sh
$ bower install --save jquery-tableslice jquery-tablesplit jquery-columnfreeze
```

## Example

Using default config:

```js
$('.example').columnFreeze();
```

Simple configuration:

```js
$('.example').columnFreeze('freeze', {
	index: 2,
	wrapperClass: 'columnfreeze-wrapper clearfix'
});
```

## Usage

```js
$('table').columnFreeze([action], [options]);
```

`$.fn.columnFreeze()` returns the original table but replaces it with a new DOM element.

### Actions

* `$('table').columnFreeze('freeze', options);`
  * Freeze a table in place
* `$('table').columnFreeze('unfreeze', options);`
  * Return the table to its original state
* `$('table').columnFreeze('config', key, [val]);`
  * Get a config value: `$('table').columnFreeze('config', 'index') === 1`
  * Set a config value: `$('table').columnFreeze('config', 'index', 2)`
  * Set multiple values: `$('table').columnFreeze('config', { index: 3 })`
* `$('table').columnFreeze('isFrozen');`
  * Returns `true` if the table is currently frozen
* `$('table').columnFreeze('init', options);`
  * Initializes a controller without freezing a table
* `$('table').columnFreeze('controller');`
  * Returns the internal controller

### Options

Default values are retrieved from `$.fn.columnFreeze.defaults`.

* `index`: (default: 1)
* `containerFixedClass`: (default: 'columnfreeze-container columnfreeze-container-fixed')
* `containerFixedCSS`
* `containerScrollClass`: (default: 'columnfreeze-container columnfreeze-container-scroll')
* `containerScrollCSS`
* `wrapperClass`: (default: 'columnfreeze-wrapper') - wrapper for above containers
* `wrapperCSS`
* `rowSelector`: (default: 'tr') - used to determine rows
* `headerSelector`: (default: 'thead tr:last-child th, thead tr:last-child td') - used to determine table headers
* `fixedWidth`: (default: null) - width of fixed section
* `scrollWidth`: (default: null) - width of scrollable section (e.g. 'auto' or '1200px')

## License

[MIT license](LICENSE).

[tableslice]: https://github.com/j-/jquery-tableslice
[tablesplit]: https://github.com/j-/jquery-tablesplit
[bower]: http://bower.io/