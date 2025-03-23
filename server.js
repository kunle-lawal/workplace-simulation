const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
console.log(`Server running at http://localhost:${PORT}/`);

http
	.createServer((req, res) => {
		// Get the file path
		let filePath = "." + req.url;
		if (filePath === "./") {
			filePath = "./index.html";
		}

		// Determine the content type
		const extname = path.extname(filePath);
		let contentType = "text/html";

		switch (extname) {
			case ".js":
				contentType = "text/javascript";
				break;
			case ".css":
				contentType = "text/css";
				break;
			case ".json":
				contentType = "application/json";
				break;
			case ".png":
				contentType = "image/png";
				break;
			case ".jpg":
				contentType = "image/jpg";
				break;
		}

		// Read the file
		fs.readFile(filePath, (err, content) => {
			if (err) {
				if (err.code === "ENOENT") {
					// Page not found
					fs.readFile("./404.html", (err, content) => {
						res.writeHead(404, { "Content-Type": "text/html" });
						res.end(content, "utf-8");
					});
				} else {
					// Server error
					res.writeHead(500);
					res.end(`Server Error: ${err.code}`);
				}
			} else {
				// Success
				res.writeHead(200, { "Content-Type": contentType });
				res.end(content, "utf-8");
			}
		});
	})
	.listen(PORT);
