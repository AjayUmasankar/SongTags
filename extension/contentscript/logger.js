const pino = require("pino");

const level = "debug";
const prettyPrint = {
	colorize: "true", // --colorize: add terminal color escape sequence to the output
	levelFirst: true, // --levelFirst: display the log level name before the logged date and time
	translateTime: "SYS:standard", // --translateTime: translate the epoch time to local system's TZ, in human readable format
	ignore: "pid,hostname,module" // --ignore: ignore one or several keys
	// singleLine: true, // --singleLine: print each log message on a single line
	// messageFormat: "({module}) {msg}" // --messageFormat: format outpout for the message portion of the log
};

export const logger = pino({
	name: "server",
	level: "debug",
	formatters: {
		level(label) {
			return { level: label };
		}
	},
	prettyPrint: prettyPrint
})