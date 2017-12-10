const shell = require("node-powershell");
let ps = new shell({
  executionPolicy: "Bypass",
  noProfile: true,
  debugMsg: false,
});

ps.addCommand("$ENV:PATH=\"C:\\Hello;\"+$ENV:PATH");
ps.addCommand("echo $ENV:PATH");
ps.on("end", (code) => {
  console.log(`We exitted with code ${code}.`);
});

console.log(ps._cmds);

ps.invoke()
  .then((output) => {
    console.log(output);
    ps.dispose();
  })
  .catch((error) => {
    console.log(err);
    ps.dispose();
  });
