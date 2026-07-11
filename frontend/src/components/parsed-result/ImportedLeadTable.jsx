"use client";

import { useState } from "react";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import StatusBadge from "./StatusBadge";

export default function ImportedLeadTable({ rows }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border overflow-hidden">

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">

          <table className="w-full text-sm">

            <thead className="sticky top-0 bg-gray-100">

              <tr>

                <th className="p-3 text-left">#</th>

                <th className="p-3 text-left">Lead Name</th>

                <th className="p-3 text-left">Email</th>

                <th className="p-3 text-left">Contact</th>

                <th className="p-3 text-left">Created</th>

                <th className="p-3 text-left">Company</th>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-left">Source</th>

                <th className="p-3 text-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {rows.map((lead, index) => (

                <tr
                  key={lead.rowIndex ?? index}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">{index + 1}</td>

                  <td className="p-3">{lead.name || "-"}</td>

                  <td className="p-3">{lead.email || "-"}</td>

                  <td className="p-3">

                    {lead.country_code}{" "}

                    {lead.mobile_without_country_code}

                  </td>

                  <td className="p-3">

                    {lead.created_at || "-"}

                  </td>

                  <td className="p-3">

                    {lead.company || "-"}

                  </td>

                  <td className="p-3">

                    <StatusBadge
                      status={lead.crm_status}
                    />

                  </td>

                  <td className="p-3">

                    {lead.data_source || "-"}

                  </td>

                  <td className="p-3 text-center">

                    <button
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      onClick={() => {

                        setSelectedLead(lead);

                        setDrawerOpen(true);

                      }}
                    >
                      More
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <LeadDetailsDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => {

          setDrawerOpen(false);

          setSelectedLead(null);

        }}
      />

    </>
  );
}