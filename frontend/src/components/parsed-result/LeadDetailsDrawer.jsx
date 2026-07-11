"use client";

export default function LeadDetailsDrawer({
  lead,
  open,
  onClose,
}) {
  if (!open || !lead) return null;

  const fields = [
    { label: "Created At", value: lead.created_at },
    { label: "Lead Name", value: lead.name },
    { label: "Email", value: lead.email },
    { label: "Country Code", value: lead.country_code },
    { label: "Mobile", value: lead.mobile_without_country_code },
    { label: "Company", value: lead.company },
    { label: "City", value: lead.city },
    { label: "State", value: lead.state },
    { label: "Country", value: lead.country },
    { label: "Lead Owner", value: lead.lead_owner },
    { label: "CRM Status", value: lead.crm_status },
    { label: "CRM Note", value: lead.crm_note },
    { label: "Data Source", value: lead.data_source },
    { label: "Possession Time", value: lead.possession_time },
    { label: "Description", value: lead.description },
  ];

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-50 overflow-y-auto">

        <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between items-center">

          <div>
            <h2 className="text-xl font-bold">
              Lead Details
            </h2>

            <p className="text-sm text-gray-500">
              Complete CRM Record
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>

        </div>

        <div className="p-6 space-y-5">

          {fields.map((field) => (

            <div
              key={field.label}
              className="border rounded-lg p-4"
            >

              <p className="text-xs uppercase text-gray-500 mb-1">
                {field.label}
              </p>

              <p className="font-medium break-words">
                {field.value || "-"}
              </p>

            </div>

          ))}

        </div>

      </div>
    </>
  );
}