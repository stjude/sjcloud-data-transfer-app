function openApp() {
  let openAppLink = document.createElement("a");
  openAppLink.href = "sjcloud://" + encodeURIComponent("Rapid RNA-Seq");
  document.body.append(openAppLink);
  openAppLink.click();
  document.body.remove(openAppLink);
}
