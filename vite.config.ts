import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		minify: true,
		rolldownOptions: {
			external: ["react", "react-dom/client"],
			output: {
				minify: {
					compress: {
						dropConsole: true,
						dropDebugger: true,
					},
				},
			},
		},
	},
});
