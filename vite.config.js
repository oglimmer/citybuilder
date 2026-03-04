import { defineConfig } from 'vite';

export default defineConfig({
	root: 'client',
	server: {
		proxy: {
			'/socket.io': {
				target: 'http://localhost:1337',
				ws: true,
			},
		},
	},
	build: {
		outDir: '../dist',
	},
});
