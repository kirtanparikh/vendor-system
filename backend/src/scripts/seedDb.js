const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting Indian Context Seeding...");

    // 1. Cleanup
    await client.query("TRUNCATE vendors, vehicles, drivers CASCADE");

    // 2. Prepare Common Password (hash once for speed)
    const commonHash = await bcrypt.hash("password123", 10);
    const commonPerms = JSON.stringify({
      can_onboard_driver: true,
      can_onboard_vehicle: true,
      can_create_subvendor: true,
    });

    const rootRes = await client.query(
      `INSERT INTO vendors (name, email, password, role, permissions)
       VALUES ($1, $2, $3, 'SUPER_VENDOR', $4) RETURNING id`,
      ["MoveInSync India HQ", "admin@vendorsystem.com", commonHash, commonPerms]
    );
    const rootId = rootRes.rows[0].id;
    console.log("✓ Created Root: India HQ");

    // 4. Define Hierarchy Data
    const regions = [
      {
        name: "West Region (Mumbai HQ)",
        cities: ["Ahmedabad", "Pune", "Mumbai"],
      },
      {
        name: "South Region (Bangalore HQ)",
        cities: ["Bangalore", "Chennai", "Hyderabad"],
      },
      { name: "North Region (Delhi HQ)", cities: ["Delhi NCR", "Jaipur"] },
    ];

    // 5. Loops to insert data
    for (const region of regions) {
      const regRes = await client.query(
        `INSERT INTO vendors (name, email, password, role, parent_id, permissions)
         VALUES ($1, $2, $3, 'SUB_VENDOR', $4, $5) RETURNING id`,
        [
          region.name,
          `region.${region.name.split(" ")[0].toLowerCase()}@test.com`,
          commonHash,
          rootId,
          commonPerms,
        ]
      );
      const regId = regRes.rows[0].id;

      for (const city of region.cities) {
        const cityRes = await client.query(
          `INSERT INTO vendors (name, email, password, role, parent_id, permissions)
           VALUES ($1, $2, $3, 'SUB_VENDOR', $4, $5) RETURNING id`,
          [
            `${city} Operations`,
            `city.${city.toLowerCase().replace(" ", "")}@test.com`,
            commonHash,
            regId,
            commonPerms,
          ]
        );
        const cityId = cityRes.rows[0].id;

        // Create 3 Drivers per City
        const driverNames = [
          "Ramesh",
          "Suresh",
          "Mahesh",
          "Patel",
          "Singh",
          "Sharma",
        ];
        for (let k = 0; k < 3; k++) {
          const dName =
            driverNames[Math.floor(Math.random() * driverNames.length)];
          await client.query(
            `INSERT INTO drivers (name, license_no, vendor_id)
             VALUES ($1, $2, $3)`,
            [
              `${dName} (${city})`,
              `DL-${city.substring(0, 2).toUpperCase()}-${Math.floor(
                Math.random() * 10000
              )}`,
              cityId,
            ]
          );
        }

        // Create 3 Vehicles per City
        const vehicleModels = ["Innova Crysta", "Ertiga", "Marazzo"];
        const stateCodes =
          city === "Delhi NCR" ? "DL" : city.substring(0, 2).toUpperCase();
        for (let k = 0; k < 3; k++) {
          const vehicleNumber = `${stateCodes}-01-AB-${Math.floor(
            Math.random() * 9999
          )}`;
          const model = vehicleModels[k % vehicleModels.length];
          await client.query(
            `INSERT INTO vehicles (vendor_id, reg_no, model, status)
             VALUES ($1, $2, $3, 'ACTIVE')`,
            [cityId, vehicleNumber, model]
          );
        }
      }
      console.log(`✓ Created Region: ${region.name}`);
    }

    console.log("✅ Database Seeding Completed Successfully!");
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

seedDatabase();
