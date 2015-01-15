/*!
 * jQuery column freeze plugin
 * @author Jamie Hoeks <j@skeoh.com>
 * @license MIT
 */
(function ($) {

'use strict';

var CONTROLLER_KEY = 'columnfreeze-controller';

/* Controller constructor */

var Controller = function ($table) {
	this.$table = $table;
	this.createElements();
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
	frozen: false,
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

$Controller.createElements = function () {
	this.$containerFixed = this.createContainerFixed();
	this.$containerScroll = this.createContainerScroll();
	this.$wrapper = this.createWrapper()
		.append(this.$containerFixed)
		.append(this.$containerScroll);
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

$Controller.freeze = function () {
	this.unfreeze();
	this.splitTable();
	this.copyColumnWidths();
	this.showClone();
	this.copyRowHeights();
	this.frozen = true;
};

$Controller.unfreeze = function () {
	if (this.isFrozen()) {
		this.showOriginal();
		this.frozen = false;
	}
};

$Controller.splitTable = function () {
	var index = this.config('index');
	var $split = this.$table.tableSplit(index);
	if (this.$tableFixed) {
		this.$tableFixed.remove();
	}
	if (this.$tableScroll) {
		this.$tableScroll.remove();
	}
	this.$tableFixed = $split.eq(0).appendTo(this.$containerFixed);
	this.$tableScroll = $split.eq(1).appendTo(this.$containerScroll);
};

$Controller.copyColumnWidths = function () {
	var index = this.config('index');
	var headerSelector = this.config('headerSelector');
	var $allHeaders = this.$table.find(headerSelector);
	var $headersFixed = this.$tableFixed.find(headerSelector);
	var $headersScroll = this.$tableScroll.find(headerSelector);
	var configWidthFixed = this.config('widthFixed');
	var configWidthScroll = this.config('widthScroll');
	var widthFixed = 1;
	var widthScroll = 1;
	var currentWidth;
	$allHeaders.slice(0, index).each(function (i) {
		currentWidth = $(this).outerWidth();
		widthFixed += currentWidth;
		$headersFixed.eq(i).width(currentWidth);
	});
	$allHeaders.slice(index).each(function (i) {
		currentWidth = $(this).outerWidth();
		widthScroll += currentWidth;
		$headersScroll.eq(i).width(currentWidth);
	});
	this.$tableFixed.width(configWidthFixed || widthFixed);
	this.$tableScroll.width(configWidthScroll || widthScroll);
	this.$containerScroll.css('left', configWidthFixed || widthFixed + 'px');
};

$Controller.copyRowHeights = function () {
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

$Controller.showOriginal = function () {
	this.$table.insertBefore(this.$wrapper);
	this.$wrapper.detach();
};

$Controller.showClone = function () {
	this.$wrapper.insertBefore(this.$table);
	this.$table.detach();
};

$Controller.isFrozen = function () {
	return this.frozen;
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
			case 'init':
				controller.config(options);
				return;
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