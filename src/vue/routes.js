import Home from './components/Home.vue'
import NotFound from './components/NotFound.vue'
import Upload from './components/Upload.vue'
import Download from './components/Download.vue'
import Install from './components/Install.vue'
import LogIn from './components/LogIn.vue'

export default function () {
	return [{
		path: '/home',
		component: Home
	},{
		path: '/install',
		component: Install
	},{
		path: '/login',
		component: LogIn
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
