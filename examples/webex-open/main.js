function hello(name) {
	console.log("Hello, " + name);
};

function openApp() {
	var openAppLink = document.createElement("a");
	openAppLink.href = "sjcloud://rapid-rnaseq";
	document.body.append(openAppLink);
	openAppLink.click();
	document.body.remove(openAppLink);
}
