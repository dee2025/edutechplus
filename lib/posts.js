import pool from "@/lib/db";

// Fetch posts metadata
export async function getAllPosts() {
  try {
    const [rows] = await pool.query(`
            SELECT a.*, b.slug as catslug, b.categoryName as catName FROM tblblogs a left join tblcategories b on a.categoryId = b.id
         where a.status = 1 and b.status = 1 AND a.publish_date <= CURDATE() ORDER BY a.createdAt DESC;`);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function getPostsCount() {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tblblogs a 
      LEFT JOIN tblcategories b ON a.categoryId = b.id 
      WHERE a.status = 1 AND b.status = 1 AND a.publish_date <= CURDATE();
    `);
    return rows[0].total;
  } catch (error) {
    throw error;
  }
}
