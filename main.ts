const udpServer = Deno.listenDatagram({
	port: 50222,
	transport: "udp",
	hostname: "0.0.0.0",
});

while(1) {
	const resp = await udpServer.receive();
	resp; //[Uint8Array, Addr]
	const message = new TextDecoder().decode(resp[0]);
	const decoded = JSON.parse(message);
	console.log(decoded);
}