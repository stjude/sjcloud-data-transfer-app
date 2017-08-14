import Welcome from './page/Welcome.vue'
import NotFound from './page/NotFound.vue'
import Upload from './page/Upload.vue'

export default function () {
	return [{
		path: '/home',
		component: Welcome
	},{
		path: '/upload',
		component: Upload
	},{
		path: '/',
		component: Welcome
	},{
		path: '/*',
		component: NotFound
	}]
}
