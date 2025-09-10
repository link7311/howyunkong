import { initDevice } from './modules/devicesHandler.js';
import { padLeft } from './modules/common.js';
import { More } from './modules/components.js';


initDevice();


// 批量掛載到 window
const globals = {
	padLeft,
	More,
};

Object.assign(window, globals);