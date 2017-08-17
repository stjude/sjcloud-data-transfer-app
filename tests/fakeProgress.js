// track upload, download by file name

let i

export default function fakeProgress(state) {
	if (i) clearInterval(i)

	i=setInterval(()=>{
		let pending=0
		state.tools.forEach(t=>{
			t.upload.forEach(f=>{
				if (f.status<100) {
					f.status = currStatus(f.status)
					pending += 1
				}
			})

			t.download.forEach(f=>{
				if (f.status<100 && f.checked) { 
					f.status = currStatus(f.status)
					pending += 1
				}
			})
		}); console.log('pending files: '+pending)

		if (i && pending==0) clearInterval(i)
	},1000)
}

function currStatus(status) {
	const s=status + Math.ceil(Math.random()*(10-2)+2)
	return s > 100 ? 100 : s
}
