/// <reference types="vite/client" />

declare module "*.ts?worker" {
	const WorkerConstructor: {
		new (): Worker;
	};
	export default WorkerConstructor;
}
