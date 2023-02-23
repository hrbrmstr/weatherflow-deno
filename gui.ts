import { crayon } from "https://deno.land/x/crayon@3.3.2/mod.ts";
import { Canvas, Tui  } from "https://deno.land/x/tui@1.3.4/mod.ts";
import { LabelComponent } from "https://deno.land/x/tui@1.3.4/src/components/mod.ts";
import { Theme } from "https://deno.land/x/tui@1.3.4/src/theme.ts";
import { handleKeyboardControls, handleKeypresses } from "https://deno.land/x/tui@1.3.4/src/keyboard.ts";

const baseTheme: Theme = {
	base: crayon.bgBlack,
	focused: crayon.bgBlack,
	active: crayon.bgBlack,
};

const tuiStyle = crayon.bgBlack.white;

const tui = new Tui({
	style: tuiStyle,
	canvas: new Canvas({
		refreshRate: 1000 / 60, // Run in 60FPS
		stdout: Deno.stdout,
	}),
});

tui.dispatch(); // Close Tui on CTRL+C

handleKeypresses(tui);
handleKeyboardControls(tui);

const lab = new LabelComponent({
	tui,
	align: {
		horizontal: "center",
		vertical: "center",
	},
	rectangle: {
		column: 75,
		row: 3,
		// Automatically adjust size
		height: -1,
		width: -1,
	},
	theme: { base: tuiStyle },
	value: "Centered text\nThat automatically adjusts its rectangle size\n!@#!\nSo cool\nWOW",
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
	lab.value = decoded.type;

});
