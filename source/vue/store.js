import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		currToolName: 'Rapid RNASeq',
		currPath: 'upload',
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
	},
	getters: {
		currTool(state) {
			return state.tools.filter(t=>t.name==state.currToolName)[0]
		},	
		currPath(state) {
			return state.currPath
		},
		tool(state) {
			return name=>state.tools.filter(t=>t.name==name)[0]
		},
		tools(state) {
			const lst=[]
			state.tools.forEach((t,i)=>{
				lst.push({
					name: t.name,
					size: t[state.currPath].reduce((a,b)=>{
						return {
							size: a.size+b.size
						}
					},{size:0}).size
				})
			})
			return lst
		},
		currFiles(state,getters) {
			const tool=getters.currTool;
			return !tool ? [] : tool[state.currPath]
		},
	},
	mutations: {
		setCurrToolName(state,toolName) {
			state.currToolName=toolName
		},
		setCurrPath(state,path) {
			state.currPath=path
		},
		addFiles(state,d) { //toolName,path,files) {
			const tool= state.tools.filter(t=>t.name==d.toolName)[0];
			if (!tool || !tool[d.path]) {
				console.log("Invalid tool name='"+d.toolName+"' and/or path='"+d.path+"'.")
				return;
			}
			const currFiles=tool[path];
			files.forEach(f=>{
				currFiles.push({
					name:f.name,
					size:f.size,
					status:0,
					checked:false
				})
			})
		}
	}
});
