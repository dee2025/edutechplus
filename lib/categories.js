import pool from "../lib/db";

export async function getAllCategories() {
  try {
    const [categories] = await pool.query(
      `SELECT * FROM tblcategories where status = 1 order by createdAt desc;`
    );
    return categories;
  } catch (error) {
    console.log("Error fetching all categories");
  }
}
