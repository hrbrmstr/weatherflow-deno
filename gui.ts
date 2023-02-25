import { crayon } from "https://deno.land/x/crayon@3.3.2/mod.ts";
import { Canvas, Tui, textWidth  } from "https://deno.land/x/tui@1.3.4/mod.ts";
import { LabelComponent } from "https://deno.land/x/tui@1.3.4/src/components/mod.ts";
import { Theme } from "https://deno.land/x/tui@1.3.4/src/theme.ts";
import { handleKeyboardControls, handleKeypresses } from "https://deno.land/x/tui@1.3.4/src/keyboard.ts";
import { timeFormat } from "https://cdn.skypack.dev/d3-time-format@4";
import { format } from "https://cdn.skypack.dev/d3-format@3";
import humanizeDuration from "https://esm.sh/humanize-duration";

const fmt = timeFormat("%Y-%m-%d %H:%M:%S");

const baseTheme: Theme = {
	base: crayon.bgBlack,
	focused: crayon.bgBlack,
	active: crayon.bgBlack,
};

const tuiStyle = crayon.bgBlack.white;

const tui = new Tui({
	style: tuiStyle,
	canvas: new Canvas({
		refreshRate: 1000, //1000 / 60, // Run in 60FPS
		stdout: Deno.stdout,
	}),
});

tui.dispatch(); // Close Tui on CTRL+C

handleKeypresses(tui);
handleKeyboardControls(tui);

// const lastMsg = new LabelComponent({
// 	tui,
// 	align: {
// 		horizontal: "left",
// 		vertical: "center",
// 	},
// 	rectangle: {
// 		column: 1,
// 		row: 5,
// 		// Automatically adjust size
// 		height: 1,
// 		width: -1,
// 	},
// 	theme: { base: tuiStyle },
// 	value: "--------------------",
// });

const temp = new LabelComponent({
	tui,
	align: {
		horizontal: "left",
		vertical: "center",
	},
	rectangle: {
		column: 1,
		row: 1,
		// Automatically adjust size
		height: 1,
		width: -1,
	},
	theme: { base: tuiStyle },
	value: "  Temp: ---------------------------------------",
});

const wind = new LabelComponent({
	tui,
	align: {
		horizontal: "left",
		vertical: "center",
	},
	rectangle: {
		column: 1,
		row: 2,
		// Automatically adjust size
		height: 1,
		width: -1,
	},
	theme: { base: tuiStyle },
	value: "  Wind: ---------------------------------------",
});

const hub = new LabelComponent({
	tui,
	align: {
		horizontal: "left",
		vertical: "center",
	},
	rectangle: {
		column: 1,
		row: 3,
		// Automatically adjust size
		height: 1,
		width: -1,
	},
	theme: { base: tuiStyle },
	value: "Uptime: ---------------------------------------",
});

const last = new LabelComponent({
	tui,
	align: {
		horizontal: "left",
		vertical: "center",
	},
	rectangle: {
		column: 1,
		row: 4,
		// Automatically adjust size
		height: 1,
		width: -1,
	},
	theme: { base: tuiStyle },
	value: "  Last: ---------------------------------------",
});

tui.run();

const udpServer = Deno.listenDatagram({
	port: 50222,
	transport: "udp",
	hostname: "0.0.0.0",
});

tui.on("update", async () => {

	const [data, _remoteAddr] = await udpServer.receive();
	const message = new TextDecoder().decode(data);
	const decoded = JSON.parse(message);

	// lastMsg.value = decoded.type;

	if (decoded.type == "obs_st") {
		temp.value = "  Temp: " + format("5.1f")(decoded.obs[0][7]) + "°C  Humid: " + format("4.1f")(decoded.obs[0][8]) + "%  Lux: " + format(",")(decoded.obs[0][9]);
		const ts = new Date(decoded.obs[0][0] * 1000);
		last.value = "  Last: " + fmt(ts);
	}

	if (decoded.type == "rapid_wind") {
		wind.value = "  Wind: " + format("4.2f")(decoded.ob[1]) + " m/s  " + format("3")(decoded.ob[2]) + "°";
		const ts = new Date(decoded.ob[0] * 1000);
		last.value = "  Last: " + fmt(ts);
	}

	if (decoded.type == "hub_status") {
		hub.value = "Uptime: " + humanizeDuration(decoded.uptime * 1000);
		const ts = new Date(decoded.timestamp * 1000);
		last.value = "  Last: " + fmt(ts);
	}

	if (decoded.type == "device_status") {
		const ts = new Date(decoded.timestamp * 1000);
		last.value = "  Last: " + fmt(ts);
	}

});
