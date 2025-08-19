import React from "react";

interface Visitor {
  email?: string;
  name?: string;
  phone?: string;
  fingerprint: string;
  visits: number;
  repeatSignups: number;
  blocked: boolean;
  lastSeen: string;
}

interface VisitorsTableProps {
  visitors: Visitor[];
}

const VisitorsTable: React.FC<VisitorsTableProps> = ({ visitors }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 border-b">Email</th>
          <th className="px-4 py-2 border-b">Name</th>
          <th className="px-4 py-2 border-b">Phone</th>
          <th className="px-4 py-2 border-b">Fingerprint</th>
          <th className="px-4 py-2 border-b">Repeat Device</th>
          <th className="px-4 py-2 border-b">Visits</th>
          <th className="px-4 py-2 border-b">Blocked</th>
          <th className="px-4 py-2 border-b">Last Seen</th>
        </tr>
      </thead>
      <tbody>
        {visitors.map((v, idx) => (
          <tr key={v.fingerprint + idx} className="text-center">
            <td className="px-4 py-2 border-b">{v.email || "-"}</td>
            <td className="px-4 py-2 border-b">{v.name || "-"}</td>
            <td className="px-4 py-2 border-b">{v.phone || "-"}</td>
            <td className="px-4 py-2 border-b font-mono text-xs">{v.fingerprint}</td>
            <td className="px-4 py-2 border-b">
              {v.repeatSignups > 1 ? (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  Repeat ({v.repeatSignups})
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </td>
            <td className="px-4 py-2 border-b">
              <span className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-semibold">
                {v.visits}
              </span>
            </td>
            <td className="px-4 py-2 border-b">
              {v.blocked ? (
                <span className="inline-block bg-red-100 text-red-800 rounded px-2 py-1 text-xs font-semibold">Blocked</span>
              ) : (
                <span className="inline-block bg-green-100 text-green-800 rounded px-2 py-1 text-xs font-semibold">Active</span>
              )}
            </td>
            <td className="px-4 py-2 border-b">{v.lastSeen}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default VisitorsTable;
