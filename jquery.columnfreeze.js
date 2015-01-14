(function ($) {

'use strict';

var CONTROLLER_KEY = 'columnfreeze-controller';

/* Controller constructor */

var Controller = function ($table) {
	this.$table = $table;
};

/* Controller static functions */

Controller.getElementController = function (el) {
	var controller = $(el).data(CONTROLLER_KEY);
	return controller || null;
};

Controller.setElementController = function (el, controller) {
	$(el).data(CONTROLLER_KEY, controller);
};

Controller.ensureElementController = function (el) {
	var $el = $(el);
	var controller = Controller.getElementController($el);
	if (!controller) {
		controller = new Controller($el);
		Controller.setElementController($el, controller);
	}
	return controller;
};

/* Controller methods */

var $Controller = Controller.prototype = {
	$table: null,
	$tableFixed: null,
	$tableScroll: null,
	$containerFixed: null,
	$containerScroll: null,
	$wrapper: null
};

$Controller.config = function (key, value) {
	var options;
	if (!this.settings) {
		this.settings = $.extend({}, $.fn.columnFreeze.defaults);
	}
	// no-op
	if (typeof key === 'undefined') {
		return;
	}
	if (typeof key === 'string') {
		// get operation
		if (arguments.length < 2) {
			return this.settings[key];
		}
		// set operation
		else {
			this.settings[key] = value;
			return;
		}
	}
	else if ($.isPlainObject(key)) {
		options = key;
		$.extend(this.settings, options);
	}
	else {
		throw new Error('Unsupported configuration arguments');
	}
};

$Controller.freeze = function () {
	this.unfreeze();
	this.pin();
	this.fixRowHeights();
};

$Controller.unfreeze = function () {
	if (this.$wrapper) {
		this.$table.insertBefore(this.$wrapper);
		this.$wrapper.remove();
		this.$wrapper = null;
	}
};

/*
	DOM tree (replaces original table)

	$wrapper
		$containerFixed
			$tableFixed
		$containerScroll
			$tableScroll
*/

$Controller.pin = function () {
	var index = this.config('index');
	var headerSelector = this.config('headerSelector');
	var tableWidth = 0;
	var $split = this.splitTable(index);
	this.$containerFixed = this.createContainerFixed();
	this.$containerScroll = this.createContainerScroll();
	this.$tableFixed = $split.eq(0).appendTo(this.$containerFixed);
	this.$tableScroll = $split.eq(1).appendTo(this.$containerScroll);
	if (this.config('scrollWidth') !== 'auto') {
		tableWidth = this.copyColumnWidths();
	}
	this.$tableFixed.width(this.config('fixedWidth'))
	this.$tableScroll.width(this.config('scrollWidth') || tableWidth + 1);
	this.$wrapper = this.createWrapper()
		.append(this.$containerFixed)
		.append(this.$containerScroll)
		.insertBefore(this.$table);
	this.$table.detach();
	this.$containerScroll.css('left', this.$containerFixed.width() + 'px');
};

$Controller.createContainerFixed = function () {
	return $(document.createElement('div'))
		.addClass(this.config('containerFixedClass'))
		.css(this.config('containerFixedCSS'));
};

$Controller.createContainerScroll = function () {
	return $(document.createElement('div'))
		.addClass(this.config('containerScrollClass'))
		.css(this.config('containerScrollCSS'));
};

$Controller.createWrapper = function () {
	return $(document.createElement('div'))
		.addClass(this.config('wrapperClass'))
		.css(this.config('wrapperCSS'));
};

$Controller.splitTable = function () {
	var index = this.config('index');
	return this.$table.tableSplit(index);
};

$Controller.copyColumnWidths = function () {
	var index = this.config('index');
	var headerSelector = this.config('headerSelector');
	var $headers = this.$table.find(headerSelector);
	var controller = this;
	var totalWidth = 0;
	$headers.each(function (i) {
		var $table, $clone;
		var $original = $(this);
		var width = $original.outerWidth();
		if (i < index) {
			$table = controller.$tableFixed;
		}
		else {
			$table = controller.$tableScroll;
			i -= index;
			totalWidth += width;
		}
		$clone = $table.find(headerSelector).eq(i);
		$clone.width(width);
	});
	return totalWidth;
};

$Controller.fixRowHeights = function () {
	var rowSelector = this.config('rowSelector');
	var $fixedRows = this.$tableFixed.find(rowSelector);
	var $scrollRows = this.$tableScroll.find(rowSelector);
	this.$table.find(rowSelector).each(function (i) {
		var $fixedRow = $fixedRows.eq(i);
		var $scrollRow = $scrollRows.eq(i);
		var max = Math.max($fixedRow.height(), $scrollRow.height());
		$fixedRow.height(max);
		$scrollRow.height(max);
	});
};

$Controller.isFrozen = function () {
	return this.$wrapper !== null;
};

/* Expose jQuery plugin */

var returnable = {
	isFrozen: true,
	config: true
};

$.fn.columnFreeze = function (action, options) {
	var args = Array.prototype.slice.call(arguments, 1);
	// the default action if none is specified
	if (typeof action !== 'string') {
		options = action;
		args.unshift(options);
		action = 'freeze';
	}
	var results = this.map(function () {
		// get controller if it exists, create otherwise
		var controller = Controller.ensureElementController(this);
		switch (action) {
			case 'freeze':
				controller.config(options);
				return controller.freeze();
			case 'unfreeze':
				controller.config(options);
				return controller.unfreeze();
			case 'isFrozen':
				return controller.isFrozen();
			case 'config':
				return $Controller.config.apply(controller, args);
			default:
				throw new Error('Unrecognized action "' + action + '"');
		}
	});
	if (action in returnable) {
		return results[0];
	}
	return this;
};

$.fn.columnFreeze.Controller = Controller;

$.fn.columnFreeze.defaults = {
	// table is split before the column at this index (0-based)
	index: 1,
	// container for fixed portion of table
	containerFixedClass: 'columnfreeze-container columnfreeze-container-fixed',
	containerFixedCSS: {
		display: 'inline-block',
		float: 'left'
	},
	// container for scrollable portion of table
	containerScrollClass: 'columnfreeze-container columnfreeze-container-scroll',
	containerScrollCSS: {
		display: 'inline-block',
		position: 'absolute',
		overflowX: 'scroll',
		right: 0
	},
	// wrapper for above containers
	wrapperClass: 'columnfreeze-wrapper',
	wrapperCSS: {
		position: 'relative',
		overflow: 'hidden',
		paddingBottom: '20px'
	},
	// used to determine rows (when fixing row heights)
	rowSelector: 'tr',
	// used to determine headers (when fixing col widths)
	headerSelector: 'thead tr:last-child th, thead tr:last-child td',
	// width of fixed section
	fixedWidth: null,
	// width of scrollable section
	scrollWidth: null
};

})(jQuery);