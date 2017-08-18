/*
	This is intended the entry file for webpacking
	all code that imports native Node modules, such
	as 'os', 'fs', 'child_process'.
	
	-- temporary fix
	-- hoping for a webpack.config solution --
	-- work in progress --
*/


// supress warning in dev environment
if (window.location.host=='localhost:3057') {
	window.dx={}
}
else {
	window.dx=require('./dx');
	console.log(window.dx)
}

