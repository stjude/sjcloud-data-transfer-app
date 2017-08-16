const data={
	tools: [{
		name: 'Rapid RNASeq',
		upload: [
			{name:'file_u1',size:12,status:0,checked:false},
			{name:'file_u2',size:10,status:0,checked:false},
			{name:'file_u3',size:8,status:0,checked:false},
			{name:'file_u4',size:16,status:0,checked:false},
			{name:'file_u5',size:20,status:0,checked:false},
			{name:'file_u6',size:5,status:0,checked:false},
			{name:'file_u7',size:11,status:0,checked:false}
		],
		download: []
	},{
		name: 'WARDEN',
		upload: [
			{name:'file_w1',size:9,status:0,checked:false},
			{name:'file_w2',size:101,status:0,checked:false}
		],
		download: [
			{name:'file_dw1',size:12,status:0,checked:false},
			{name:'file_dw2',size:10,status:0,checked:false},
			{name:'file_dw3',size:8,status:0,checked:false},
		]
	},{
		name: 'ChiP-Seq',
		upload: [
			{name:'file_s1',size:12,status:0,checked:false},
			{name:'file_s2',size:10,status:0,checked:false},
			{name:'file_s3',size:8,status:0,checked:false},
			{name:'file_s4',size:16,status:0,checked:false},
			{name:'file_s5',size:20,status:0,checked:false}
		],
		download: [
			{name:'file_sd1',size:12,status:0,checked:false}
		]
	}]
}

const store={
	data: data
}

window.sjcda_store=store

export default store
