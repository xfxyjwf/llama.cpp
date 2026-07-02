export const API_MODELS = {
	LIST: '/v1/models',
	LOAD: '/models/load',
	UNLOAD: '/models/unload'
};

// chat completion routes, the control route drives realtime inference (e.g. end reasoning)
export const API_CHAT = {
	COMPLETIONS: './v1/chat/completions',
	CONTROL: './v1/chat/completions/control'
};

// slot introspection, requires the --slots flag on the server
export const API_SLOTS = {
	LIST: './slots'
};

// proxy-server image store: attached images are uploaded once and referenced
// by the stable URL the server returns (see process-uploaded-files.ts)
export const API_IMAGES = {
	UPLOAD: '/images'
};

export const API_TOOLS = {
	LIST: '/tools',
	EXECUTE: '/tools'
};

/** CORS proxy endpoint path */
export const CORS_PROXY_ENDPOINT = '/cors-proxy';
