const udpServer = Deno.listenDatagram({
	port: 50222,
	transport: "udp",
	hostname: "0.0.0.0",
});

for await (const [ data, _remoteAddr ] of udpServer) { // [Uint8Array, Addr]
	const message = new TextDecoder().decode(data);
	const decoded = JSON.parse(message);
	console.log(decoded);
}