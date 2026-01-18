"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Breadcrumb from "./include/Breadcrumb";

export default function Page() {
  const [blogsCount, setBlogsCount] = useState([]);

  const breadcrumbData = [{ label: "Dashboard", href: "/admin" }];

  useEffect(() => {
    axios
      .get("/api/adm/getblogcounts")
      .then((response) => {
        setBlogsCount(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  return (
    <div className="admin-dashboard">
      <Breadcrumb breadcrumbData={breadcrumbData} />
      <div className="row">
        {blogsCount.map((blogs) => (
          <div className="col-md-4 mb-4" key={blogs.id}>
            <div className="card shadow-sm ">
              <div className="card-body">
                <h5
                  className="card-title"
                  // style={{
                  //   color: blogs.status !== 1 ? "red" : "",
                  // }}
                >
                  {blogs.categoryName}
                  <span style={{ fontSize: "12px", color: "red", marginLeft: "8px" }}>
                    {blogs.status !== 1 ? "(This is not active)" : ""}
                  </span>
                </h5>
                <p className="card-text">Total Blogs: {blogs.blogCount}</p>
                {/* <a
                  href={`/admin/categories/${blogs.slug}`}
                  className="btn btn-primary"
                >
                  View Blogs
                </a> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
