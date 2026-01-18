"use client";

import TableLoader from "@/components/admin/ui/TableLoader";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dateOnly } from "../../../../utils/common-functions";
import Breadcrumb from "../include/Breadcrumb";

export default function Page() {
    const [admins, setadmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbData = [
        { label: "Dashboard", href: "/admin" },
        { label: "Ads", href: "/admin" },
    ];

    // Fetch referral links data
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await axios.get("/api/adm/admin-manage");
                if (response.status === 200) {
                    setadmins(response.data);
                }
            } catch (error) {
                console.error("Error fetching referral links:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, []);

    return (
        <div className="admin-blogs">
            <Breadcrumb breadcrumbData={breadcrumbData} />
            <div className="card border-0 shadow-sm px-2">
                <div className="card-header border-0 bg-white d-flex justify-content-between align-items-center">
                    <h3 className="fs-4 m-0">Admin Management</h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="d-flex w-full justify-content-center py-5">
                            <TableLoader />
                        </div>
                    ) : (
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    <th>Updated At</th>
                                    {/* <th>Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {admins.length > 0 ? (
                                    admins.map((admin) => (
                                        <tr key={admin.ad_id}>
                                            <td>{admin.full_name}</td>
                                            <td>{admin.email}</td>
                                            <td>{admin.password}</td>
                                            <td>{dateOnly(admin.updated_at)}</td>
                                            {/* <td>
                                                <Link href={`/admin/ads/${admin.ad_id}`}>
                                                    <button className="btn btn-sm btn-primary">
                                                        Update
                                                    </button>
                                                </Link>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            Not available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
