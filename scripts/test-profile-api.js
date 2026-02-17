require("dotenv").config({ path: ".env.local" });
const http = require("http");

// Test API endpoint
function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: path,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function test() {
  console.log("🧪 Testing Profile API:\n");

  const paths = [
    "/api/users/gautam-sharma/profile",
    "/api/users/5/profile",
    "/api/users/gautam/profile",
  ];

  for (const path of paths) {
    console.log(`Testing: ${path}`);
    try {
      const result = await testAPI(path);
      console.log(`  Status: ${result.status}`);
      const body = JSON.parse(result.body);
      if (body.user) {
        console.log(`  ✓ Found user: ${body.user.name} (@${body.user.username})`);
      } else if (body.message) {
        console.log(`  ✗ Error: ${body.message}`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
    console.log();
  }
}

test().catch(console.error);
