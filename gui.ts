import { crayon } from "https://deno.land/x/crayon@3.3.2/mod.ts";
import { Canvas, Tui  } from "https://deno.land/x/tui@1.3.4/mod.ts";
// import { LabelComponent, TextboxComponent } from "https://deno.land/x/tui@1.3.4/src/components/mod.ts";
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
		refreshRate: 1000, //1000 / 60, // Run in 60FPS
		stdout: Deno.stdout,
	}),
});

tui.dispatch(); // Close Tui on CTRL+C

handleKeypresses(tui);
handleKeyboardControls(tui);


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

	tui.canvas.draw(
		(tui.canvas.size.columns / 2) - (decoded.type.length / 2),
		tui.canvas.size.rows / 2,
		baseTheme.base(decoded.type)
	);

	if (decoded.type == "obs_st") {
		tui.canvas.draw(
			0, 0, 
			"" + (decoded.obs[0][7] * (9.0 / 5.0) + 32.0)
		)
	}

	if (decoded.type == "rapid_wind") {
		tui.canvas.draw(
			0, 0,
			"" + (decoded.ob[2])
		)
	}

});
