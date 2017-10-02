import jquery from 'jquery';

/*
	This should be called bootstrap requires or imports,
	in case a "jQuery" instance is not available globally and yet
	required for modules such as 
	node_modules/bootstrap/.../transition.js.

	The best place to import this module is in App.vue,
	before importing other modules there.
*/

if (window.jQuery) {
	console.log('Potential jQuery conflict detectd in jQueryGlobalizer.js');
}
else {
	// Assigning jQuery should lead to the same jquery instance
	// receiving the plug-ins that are attached by bootstrap 
	// caveat: expects no other modules to create/override this global jQuery
	window.jQuery=jquery;
}

export default jquery;
