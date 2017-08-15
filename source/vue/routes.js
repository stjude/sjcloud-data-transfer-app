import Home from './page/Home.vue'
import NotFound from './page/NotFound.vue'
import Upload from './page/Upload.vue'

export default function () {
	return [{
		path: '/home',
		component: Home
	},{
		path: '/upload',
		component: Upload
	},{
		path: '/download',
		component: Upload
	},{
		path: '/',
		component: Home
	},{
		path: '*',
		component: NotFound
	}]
}
