import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel | AI Interview Platform",
    description: "Manage interview types and configurations",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-root min-h-screen bg-slate-950">
            {children}
        </div>
    );
}
