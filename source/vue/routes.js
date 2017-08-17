import Home from './components/Home.vue'
import NotFound from './components/NotFound.vue'
import Upload from './components/Upload.vue'
import Download from './components/Download.vue'

export default function () {
	return [{
		path: '/home',
		component: Home
	},{
		path: '/upload',
		component: Upload
	},{
		path: '/download',
		component: Download
	},{
		path: '/',
		component: Home
	},{
		path: '*',
		component: NotFound
	}]
}
